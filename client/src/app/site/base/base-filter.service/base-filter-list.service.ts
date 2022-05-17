import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FilterListService } from 'src/app/ui/base/filter-service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';
import { StorageService } from '../../../gateways/storage.service';
import { BaseViewModel } from '../base-view-model';
import { OsFilter, OsFilterIndicator, OsFilterOption, OsFilterOptionCondition } from './os-filter';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';

/**
 * Extends the BaseViewModel with a parent
 * Required to represent parent-child relationships in the filter
 */
interface HierarchyModel extends BaseViewModel {
    parent: BaseViewModel;
    children: BaseViewModel<any>[];
}

/**
 * Filter for the list view. List views can subscribe to its' dataService (providing filter definitions)
 * and will receive their filtered data as observable
 */
export abstract class BaseFilterListService<V extends BaseViewModel> implements FilterListService<V> {
    /**
     * stores the currently used raw data to be used for the filter
     */
    private inputData: V[] = [];

    /**
     * Subscription for the inputData list.
     * Acts as an semaphore for new filtered data
     */
    protected inputDataSubscription: Subscription | null = null;

    /**
     * The currently used filters.
     */
    public filterDefinitions: OsFilter<V>[] = [];

    /**
     * @returns the total count of items before the filter
     */
    public get unfilteredCount(): number {
        return this.inputData ? this.inputData.length : 0;
    }

    /**
     * @returns the amount of items that pass the filter service's filters
     */
    public get filteredCount(): number {
        return this.outputSubject.getValue().length;
    }

    /**
     * Returns all OsFilters containing active filters
     */
    public get activeFilters(): OsFilter<V>[] {
        return this.filterDefinitions.filter(def =>
            def.options.find((option: OsFilterOption | string | undefined) => {
                if (typeof option === `string`) {
                    return false;
                }
                return option?.isActive;
            })
        );
    }

    public get filterCount(): number {
        if (this.filterDefinitions) {
            return this.filterDefinitions.reduce((a, b) => a + (b.count || 0), 0);
        } else {
            return 0;
        }
    }

    /**
     * The observable output for the filtered data
     */
    private readonly outputSubject = new BehaviorSubject<V[]>([]);

    /**
     * @return Observable data for the filtered output subject
     */
    public get outputObservable(): Observable<V[]> {
        return this.outputSubject.asObservable();
    }

    /**
     * Boolean indicating if there are any filters described in this service
     *
     * @returns true if there are defined filters (regardless of current state)
     */
    public get hasFilterOptions(): boolean {
        return !!this.filterDefinitions && this.filterDefinitions.length > 0;
    }

    /**
     * Stack OsFilters
     */
    private _filterStack: OsFilterIndicator<V>[] = [];

    /**
     * get stacked filters
     */
    public get filterStack(): OsFilterIndicator<V>[] {
        return this._filterStack;
    }

    /**
     * The key to access stored valued
     */
    protected abstract readonly storageKey: string;

    public constructor(private store: StorageService, private historyService: HistoryService) {}

    /**
     * Initializes the filterService.
     *
     * @param inputData Observable array with ViewModels
     */
    public async initFilters(inputData: Observable<V[]>): Promise<void> {
        let storedFilter: OsFilter<V>[] | null = null;
        if (!this.historyService.isInHistoryMode()) {
            storedFilter = await this.store.get<OsFilter<V>[]>(`filter_` + this.storageKey);
        }

        if (storedFilter && this.isOsFilter(storedFilter)) {
            this.filterDefinitions = storedFilter;
            this.activeFiltersToStack();
        } else {
            this.filterDefinitions = this.getFilterDefinitions();
            this.storeActiveFilters();
        }

        if (this.inputDataSubscription) {
            this.inputDataSubscription.unsubscribe();
            this.inputDataSubscription = null;
        }
        this.inputDataSubscription = inputData.subscribe(data => {
            this.inputData = data;
            this.updateFilteredData();
        });
    }

    /**
     * Recreates the filter stack out of active filter definitions
     */
    private activeFiltersToStack(): void {
        const stack: OsFilterIndicator<V>[] = [];
        for (const activeFilter of this.activeFilters) {
            const activeOptions = activeFilter.options.filter((option: OsFilterOption | string) => {
                if (typeof option === `string`) {
                    return false;
                }
                return option.isActive;
            });
            for (const option of activeOptions) {
                stack.push({
                    property: activeFilter.property,
                    option: option as OsFilterOption
                });
            }
        }
        this._filterStack = stack;
    }

    /**
     * Checks if the (stored) filter list matches the current definition of OsFilter<V>
     *
     * @param storedFilter
     * @returns boolean
     */
    private isOsFilter(storedFilter: OsFilter<V>[]): boolean {
        if (Array.isArray(storedFilter) && storedFilter.length) {
            return storedFilter.every(
                filter =>
                    // Interfaces do not exist at runtime. Manually check if the
                    // Required information of the interface are present
                    filter.hasOwnProperty(`options`) && filter.hasOwnProperty(`property`) && !!filter.property
            );
        } else {
            return false;
        }
    }

    /**
     * Enforce children implement a method that returns actual filter definitions
     */
    protected abstract getFilterDefinitions(): OsFilter<V>[];

    /**
     * Takes the filter definition from children and using {@link getFilterDefinitions}
     * and sets/updates {@link filterDefinitions}
     */
    public async setFilterDefinitions(): Promise<void> {
        if (!this.filterDefinitions) {
            return;
        }

        const nextDefinitions = this.getFilterDefinitions();

        let storedFilters: OsFilter<V>[] = [];
        if (!this.historyService.isInHistoryMode()) {
            storedFilters = await this.store.get<OsFilter<V>[]>(`filter_` + this.storageKey);
        }

        if (!(storedFilters && storedFilters.length && nextDefinitions && nextDefinitions.length)) {
            return;
        }

        for (const nextDefinition of nextDefinitions) {
            nextDefinition.count = this.getCountForFilterOptions(nextDefinition, storedFilters);
        }

        this.filterDefinitions = nextDefinitions ?? []; // Prevent being null or undefined
        this.storeActiveFilters();
    }

    private getCountForFilterOptions(nextFilterDefinition: OsFilter<V>, storedFilters: OsFilter<V>[]): number {
        if (!nextFilterDefinition) {
            return 0;
        }
        let count = 0;
        const matchingExistingFilter = storedFilters.find(oldDef => oldDef.property === nextFilterDefinition.property);
        for (const option of nextFilterDefinition.options) {
            if (typeof option !== `object`) {
                continue;
            }
            if (!matchingExistingFilter || !matchingExistingFilter.options) {
                continue;
            }
            const existingOption = matchingExistingFilter.options.find(toCompare => {
                if (typeof toCompare === `string` || !toCompare) {
                    return false;
                }
                return JSON.stringify(toCompare.condition) === JSON.stringify(option.condition);
            }) as OsFilterOption;
            if (existingOption) {
                option.isActive = existingOption.isActive;
            }
            if (option.isActive) {
                ++count;
            }
        }
        return count;
    }

    /**
     * Helper function to get the `viewModelListObservable` of a given repository object and creates dynamic
     * filters for them
     */
    protected updateFilterForRepo<OV extends BaseViewModel>({
        repo,
        filter,
        noneOptionLabel,
        filterFn
    }: {
        repo: ViewModelListProvider<OV>;
        filter: OsFilter<V>;
        noneOptionLabel?: string;
        filterFn?: (filter: OV) => boolean;
    }): void {
        repo.getViewModelListObservable().subscribe(viewModels => {
            if (viewModels && viewModels.length) {
                const filterProperties: (OsFilterOption | string)[] = viewModels
                    .filter(filterFn ?? (() => true))
                    .map((model: any) => ({
                        condition: model.id,
                        label: model.getTitle(),
                        isChild: !!model.parent,
                        children:
                            model.children && model.children.length
                                ? model.children.map((child: any) => ({
                                      label: child.getTitle(),
                                      condition: child.id
                                  }))
                                : undefined
                    }));

                if (noneOptionLabel) {
                    filterProperties.push(`-`);
                    filterProperties.push({
                        condition: null,
                        label: noneOptionLabel
                    });
                }

                filter.options = filterProperties;
                this.setFilterDefinitions();
            }
        });
    }

    /**
     * Update the filtered data and store the current filter options
     */
    public storeActiveFilters(): void {
        this.updateFilteredData();
        if (!this.historyService.isInHistoryMode()) {
            this.store.set(`filter_` + this.storageKey, this.filterDefinitions);
        }
    }

    /**
     * Applies current filters in {@link filterDefinitions} to the {@link inputData} list
     * and publishes the filtered data to the observable {@link outputSubject}
     */
    private updateFilteredData(): void {
        let filteredData: V[] = [];
        if (this.inputData) {
            const preFilteredList = this.preFilter(this.inputData);
            if (preFilteredList) {
                this.inputData = preFilteredList;
            }

            if (!this.filterDefinitions || !this.filterDefinitions.length) {
                filteredData = this.inputData;
            } else {
                filteredData = this.inputData.filter(item =>
                    this.filterDefinitions.every(filter => !filter.count || this.isPassingFilter(item, filter))
                );
            }
        }

        this.outputSubject.next(filteredData);
        this.activeFiltersToStack();
    }

    /**
     * Had to be overwritten by children if required
     * Adds the possibility to filter the inputData before the user applied filter
     *
     * @param rawInputData will be set to {@link this.inputData}
     * @returns should be a filtered version of `rawInputData`. Returns void if unused
     */
    protected preFilter(rawInputData: V[]): V[] | void {}

    /**
     * Toggles a filter option, to be called after a checkbox state has changed.
     *
     * @param filterName a filter name as string
     * @param option filter option
     */
    public toggleFilterOption(filterName: keyof V, option: OsFilterOption): void {
        if (option.isActive) {
            this.removeFilterOption(filterName, option);
        } else {
            this.addFilterOption(filterName, option);
        }
        this.storeActiveFilters();
    }

    /**
     * Apply a newly created filter
     *
     * @param filterProperty new filter as string
     * @param option filter option
     */
    protected addFilterOption(filterProperty: keyof V, option: OsFilterOption): void {
        const filter = this.filterDefinitions.find(f => f.property === filterProperty);

        if (!filter) {
            return;
        }
        const filterOption = filter.options.find(
            o => typeof o !== `string` && o.condition === option.condition
        ) as OsFilterOption;

        if (filterOption && !filterOption.isActive) {
            filterOption.isActive = true;
            this._filterStack.push({ property: filterProperty, option });

            if (!filter.count) {
                filter.count = 1;
            } else {
                filter.count += 1;
            }

            if (filterOption.children && filterOption.children.length) {
                filterOption.children.forEach(child => this.addFilterOption(filterProperty, child));
            }
        }
    }

    /**
     * Remove a filter option.
     *
     * @param filterProperty The property name of this filter
     * @param option The option to disable
     */
    protected removeFilterOption(filterProperty: keyof V, option: OsFilterOption): void {
        const filter = this.filterDefinitions.find(f => f.property === filterProperty);
        if (!filter) {
            return;
        }
        const filterOption = filter.options.find(
            o => typeof o !== `string` && o.condition === option.condition
        ) as OsFilterOption;
        if (filterOption && filterOption.isActive) {
            filterOption.isActive = false;

            // remove filter from stack
            const removeIndex = this._filterStack
                .map(stacked => stacked.option)
                .findIndex(mappedOption => mappedOption.condition === option.condition);

            if (removeIndex > -1) {
                this._filterStack.splice(removeIndex, 1);
            }

            if (filter.count) {
                filter.count -= 1;
            }

            if (filterOption.children && filterOption.children.length) {
                filterOption.children.forEach(child => this.removeFilterOption(filterProperty, child));
            }
        }
    }

    /**
     * Checks if a given BaseViewModel passes a filter.
     *
     * @param item Usually a view model
     * @param filter The filter to check
     * @returns true if the item is to be displayed according to the filter
     */
    private isPassingFilter(item: V, filter: OsFilter<V>): boolean {
        const relevantOptions = filter.options.filter(
            option => typeof option !== `string` && option.isActive
        ) as OsFilterOption[];
        for (const option of relevantOptions) {
            const isPassingFilterOption = this.isPassingFilterOption(item, item[filter.property], option.condition);
            if (!filter.isAndConnected && isPassingFilterOption) {
                return true;
            } else if (filter.isAndConnected && !isPassingFilterOption) {
                return false;
            }
        }

        return filter.isAndConnected as boolean;
    }

    /**
     * Checks an item against a single filter option.
     *
     * @param item A BaseModel to be checked
     * @param property The parent filter
     * @param condition The option to be checked
     * @returns true if the filter condition matches the item
     */
    private isPassingFilterOption(item: V, property: unknown, condition: OsFilterOptionCondition): boolean {
        const conditions = Array.isArray(condition) ? condition : [condition];
        let toCheck = property;

        if (typeof toCheck === `function`) {
            toCheck = toCheck.bind(item)();
        }
        if (!Array.isArray(toCheck)) {
            toCheck = toCheck ? [toCheck] : [];
        }
        if (conditions.includes(null)) {
            return (<any[]>toCheck).length === 0 || toCheck === null;
        }
        return (toCheck as any[]).some(value => {
            if (conditions.includes(value)) {
                return true;
            }
            if (conditions.includes(value?.toString())) {
                return true;
            }
            if (typeof value === `object` && `id` in value && conditions.includes(value.id)) {
                return true;
            }
            return false;
        });
    }

    /**
     * Retrieves a translatable label or filter property used for displaying the filter
     *
     * @param filter
     * @returns a name, capitalized first character
     */
    public getFilterName(filter: OsFilter<V>): string {
        if (filter.label) {
            return filter.label;
        } else {
            const itemProperty = filter.property as string;
            return itemProperty.charAt(0).toUpperCase() + itemProperty.slice(1);
        }
    }

    /**
     * Removes all active options of a given filter, clearing it
     *
     * @param filter
     * @param update
     */
    public clearFilter(filter: OsFilter<V>, update: boolean = true): void {
        filter.options.forEach(option => {
            if (typeof option === `object` && option.isActive) {
                this.removeFilterOption(filter.property, option);
            }
        });
        if (update) {
            this.storeActiveFilters();
        }
    }

    /**
     * Removes all filters currently in use from this filterService
     */
    public clearAllFilters(): void {
        if (this.filterDefinitions && this.filterDefinitions.length) {
            this.filterDefinitions.forEach(filter => {
                this.clearFilter(filter, false);
            });
            this.storeActiveFilters();
        }
    }
}
