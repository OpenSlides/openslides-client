import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FilterListData, FilterListService } from 'src/app/ui/base/filter-service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';
import { StorageService } from '../../../gateways/storage.service';
import { BaseViewModel } from '../base-view-model';
import { OsFilter, OsFilterIndicator, OsFilterOption, OsFilterOptionCondition } from './os-filter';
import { Injectable } from '@angular/core';

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
Injectable({
    providedIn: `root`
})
export abstract class BaseFilterListService<V extends BaseViewModel> implements FilterListService<V> {
    public filterListData: FilterListData<V>;

    /**
     * stores the currently used raw data to be used for the filter
     */
    public get inputData(): V[] {
        return this.filterListData.inputData;
    } //TODO: may need a setter too

    /**
     * Subscription for the inputData list.
     * Acts as an semaphore for new filtered data
     */
    // protected inputDataSubscription: Subscription | null = null;

    /**
     * The currently used filters.
     */
    public get filterDefinitions(): OsFilter<V>[] {
        return this.filterListData.filterDefinitions;
    };

    /**
     * @returns the total count of items before the filter
     */
    public get unfilteredCount(): number {
        return this.filterListData.inputData ? this.filterListData.inputData.length : 0;
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
        if (this.filterListData.filterDefinitions) {
            return this.filterListData.filterDefinitions.reduce((a, b) => a + (b.count || 0), 0);
        } else {
            return 0;
        }
    }

    /**
     * The observable output for the filtered data
     */
    // private readonly outputSubject = new BehaviorSubject<V[]>([]);

    /**
     * @return Observable data for the filtered output subject
     */
    public get outputObservable(): Observable<V[]> {
        return this.filterListData.outputObservable;
    }

    /**
     * Boolean indicating if there are any filters described in this service
     *
     * @returns true if there are defined filters (regardless of current state)
     */
    public get hasFilterOptions(): boolean {
        return !!this.filterListData.filterDefinitions && this.filterListData.filterDefinitions.length > 0;
    }

    /**
     * get stacked filters
     */
    public get filterStack(): OsFilterIndicator<V>[] {
        return this.filterListData.filterStack;
    }

    protected get storageKey(): string {
        return this.filterListData.storageKey;
    }

    /**
     * The key to access stored valued
     */
    // protected abstract readonly storageKey: string;

    public constructor(private store: StorageService) {
        this.filterListData = new FilterListData<V>();
    }

    /**
     * Method that initializes the Storagekey, should be overwritten by subclasses and called in the constructor.
     * Should look like: this.filterListData.storageKey = `this is the key`;
     */
    protected abstract initializeStorageKey();

    public setOutputObservable(data: V[], info: FilterListData<V> = this.filterListData): void {
        info.outputSubject.next(data);
    }

    /**
     * Initializes the filterService.
     *
     * @param inputData Observable array with ViewModels
     */
    public async initFilters(inputData: Observable<V[]>, info: FilterListData<V> = this.filterListData, getFilterFromStorage: boolean = true): Promise<void> {
        let storedFilter: OsFilter<V>[] | null = null;
        if (getFilterFromStorage) {
            storedFilter = await this.store.get<OsFilter<V>[]>(`filter_` + info.storageKey);
        }

        if (storedFilter && this.isOsFilter(storedFilter)) {
            info.filterDefinitions = storedFilter;
            this.activeFiltersToStack(info);
        } else {
            info.filterDefinitions = this.getFilterDefinitions();
            this.storeActiveFilters(true, info);
        }

        if (info.inputDataSubscription) {
            info.inputDataSubscription.unsubscribe();
            info.inputDataSubscription = null;
        }
        info.inputDataSubscription = inputData.subscribe(data => {
            info.inputData = data;
            this.updateFilteredData(info);
        });
    }

    /**
     * Recreates the filter stack out of active filter definitions
     */
    public activeFiltersToStack(info: FilterListData<V> = this.filterListData): void {
        const stack: OsFilterIndicator<V>[] = [];
        for (const activeFilter of info.activeFilters) {
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
        info.filterStack = stack;
    }

    /**
     * Checks if the (stored) filter list matches the current definition of OsFilter<V>
     *
     * @param storedFilter
     * @returns boolean
     */
    public isOsFilter(storedFilter: OsFilter<V>[]): boolean {
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
    public async setFilterDefinitions(info: FilterListData<V> = this.filterListData): Promise<void> {
        if (!info.filterDefinitions) {
            return;
        }

        const nextDefinitions = this.getFilterDefinitions();

        let storedFilters: OsFilter<V>[] = [];
        storedFilters = await this.store.get<OsFilter<V>[]>(`filter_` + info.storageKey);

        if (!(storedFilters && storedFilters.length && nextDefinitions && nextDefinitions.length)) {
            return;
        }

        for (const nextDefinition of nextDefinitions) {
            nextDefinition.count = this.getCountForFilterOptions(nextDefinition, storedFilters);
        }

        info.filterDefinitions = nextDefinitions ?? []; // Prevent being null or undefined
        this.storeActiveFilters(true, info);
    }

    public getCountForFilterOptions(nextFilterDefinition: OsFilter<V>, storedFilters: OsFilter<V>[]): number {
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
    public updateFilterForRepo<OV extends BaseViewModel>({
        repo,
        filter,
        noneOptionLabel,
        filterFn
    }: {
        repo: ViewModelListProvider<OV>;
        filter: OsFilter<V>;
        noneOptionLabel?: string;
        filterFn?: (filter: OV) => boolean;
    }, info: FilterListData<V> = this.filterListData): void {
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
                this.setFilterDefinitions(info);
            }
        });
    }

    /**
     * Update the filtered data and store the current filter options
     */
    public storeActiveFilters(storeLocally: boolean = true, info: FilterListData<V> = this.filterListData): void {
        this.updateFilteredData(info);
        if (storeLocally) {
            this.store.set(`filter_` + info.storageKey, info.filterDefinitions);
        }
    }

    /**
     * Applies current filters in {@link filterDefinitions} to the {@link inputData} list
     * and publishes the filtered data to the observable {@link outputSubject}
     */
    public updateFilteredData(info: FilterListData<V> = this.filterListData): void {
        let filteredData: V[] = [];
        if (info.inputData) {
            const preFilteredList = this.preFilter(info, info.inputData);
            if (preFilteredList) {
                info.inputData = preFilteredList;
            }

            if (!info.filterDefinitions || !info.filterDefinitions.length) {
                filteredData = info.inputData;
            } else {
                filteredData = info.inputData.filter(item =>
                    info.filterDefinitions.every(filter => !filter.count || this.isPassingFilter(item, filter))
                );
            }
        }

        info.outputSubject.next(filteredData);
        this.activeFiltersToStack(info);
    }

    /**
     * Had to be overwritten by children if required
     * Adds the possibility to filter the inputData before the user applied filter
     *
     * @param rawInputData will be set to {@link this.inputData}
     * @returns should be a filtered version of `rawInputData`. Returns void if unused
     */
    protected preFilter(info: FilterListData<V> = this.filterListData, rawInputData: V[]): V[] | void {}

    /**
     * Toggles a filter option, to be called after a checkbox state has changed.
     *
     * @param filterName a filter name as string
     * @param option filter option
     */
    public toggleFilterOption(filterName: keyof V, option: OsFilterOption, info: FilterListData<V> = this.filterListData): void {
        if (option.isActive) {
            this.removeFilterOption(filterName, option, info);
        } else {
            this.addFilterOption(filterName, option, info);
        }
        this.storeActiveFilters(true, info);
    }

    /**
     * Apply a newly created filter
     *
     * @param filterProperty new filter as string
     * @param option filter option
     */
    protected addFilterOption(filterProperty: keyof V, option: OsFilterOption, info: FilterListData<V> = this.filterListData): void {
        const filter = info.filterDefinitions.find(f => f.property === filterProperty);

        if (!filter) {
            return;
        }
        const filterOption = filter.options.find(
            o => typeof o !== `string` && o.condition === option.condition
        ) as OsFilterOption;

        if (filterOption && !filterOption.isActive) {
            filterOption.isActive = true;
            info.filterStack.push({ property: filterProperty, option });

            if (!filter.count) {
                filter.count = 1;
            } else {
                filter.count += 1;
            }

            if (filterOption.children && filterOption.children.length) {
                filterOption.children.forEach(child => this.addFilterOption(filterProperty, child, info));
            }
        }
    }

    /**
     * Remove a filter option.
     *
     * @param filterProperty The property name of this filter
     * @param option The option to disable
     */
    protected removeFilterOption(filterProperty: keyof V, option: OsFilterOption, info: FilterListData<V> = this.filterListData): void {
        const filter = info.filterDefinitions.find(f => f.property === filterProperty);
        if (!filter) {
            return;
        }
        const filterOption = filter.options.find(
            o => typeof o !== `string` && o.condition === option.condition
        ) as OsFilterOption;
        if (filterOption && filterOption.isActive) {
            filterOption.isActive = false;

            // remove filter from stack
            const removeIndex = info.filterStack
                .map(stacked => stacked.option)
                .findIndex(mappedOption => mappedOption.condition === option.condition);

            if (removeIndex > -1) {
                info.filterStack.splice(removeIndex, 1);
            }

            if (filter.count) {
                filter.count -= 1;
            }

            if (filterOption.children && filterOption.children.length) {
                filterOption.children.forEach(child => this.removeFilterOption(filterProperty, child, info));
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
    private clearFilter(info: FilterListData<V> = this.filterListData, filter: OsFilter<V>, update: boolean = true): void {
        filter.options.forEach(option => {
            if (typeof option === `object` && option.isActive) {
                this.removeFilterOption(filter.property, option, info);
            }
        });
        if (update) {
            this.storeActiveFilters(true, info);
        }
    }

    /**
     * Removes all filters currently in use from this filterService
     */
    public clearAllFilters(info: FilterListData<V> = this.filterListData): void {
        if (info.filterDefinitions && info.filterDefinitions.length) {
            info.filterDefinitions.forEach(filter => {
                this.clearFilter(info, filter, false);
            });
            this.storeActiveFilters(true, info);
        }
    }
}
