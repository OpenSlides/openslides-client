import { Observable } from 'rxjs';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseFilterListService } from 'src/app/site/base/base-filter.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { FilterListData, FilterListService, OsFilter, OsFilterIndicator, OsFilterOption } from 'src/app/ui/base/filter-service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';
import { HistoryService } from '../pages/history/services/history.service';

export abstract class BaseMeetingFilterListService<V extends BaseViewModel> implements FilterListService<V> {
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

    // public set filterDefinitions(data: OsFilter<V>[]) {
    //     this.baseFilterListService.filterDefinitions = data;
    // }

    // public set inputData(data: V[]) {
    //     this.baseFilterListService.inputData = data;
    // }

    /**
     * The key to access stored valued
     */
    // protected abstract readonly storageKey: string;

    constructor(private baseFilterListService: BaseFilterListService<V>, private store: StorageService, private historyService: HistoryService, storageKey: string =`AssignmentList`) {
        this.filterListData = new FilterListData<V>(storageKey);
    }

    /**
     * Enforce children implement a method that returns actual filter definitions
     */
    protected abstract getFilterDefinitions(): OsFilter<V>[];

    public getFilterName(filter: OsFilter<V>): string {
        return this.baseFilterListService.getFilterName(filter);
    }

    public toggleFilterOption(property: keyof V, option: OsFilterOption): void {
        if (option.isActive) {
            this.baseFilterListService.removeFilterOption(property, option, this.filterListData);
        } else {
            this.baseFilterListService.addFilterOption(property, option, this.filterListData);
        }
        this.storeActiveFilters();
    }

    public async initFilters(inputData: Observable<V[]>): Promise<void> {
        let storedFilter: OsFilter<V>[] | null = null;
        if (!this.historyService.isInHistoryMode()) {
            storedFilter = await this.store.get<OsFilter<V>[]>(`filter_` + this.filterListData.storageKey);
        }

        if (storedFilter && this.baseFilterListService.isOsFilter(storedFilter)) {
            this.filterListData.filterDefinitions = storedFilter;
            this.baseFilterListService.activeFiltersToStack(this.filterListData);
        } else {
            this.filterListData.filterDefinitions = this.getFilterDefinitions();
            this.storeActiveFilters();
        }

        if (this.filterListData.inputDataSubscription) {
            this.filterListData.inputDataSubscription.unsubscribe();
            this.filterListData.inputDataSubscription = null;
        }
        this.filterListData.inputDataSubscription = inputData.subscribe(data => {
            this.filterListData.inputData = data;
            this.updateFilteredData();
        });
    }

    /**
     * Takes the filter definition from children and using {@link getFilterDefinitions}
     * and sets/updates {@link filterDefinitions}
     */
    public async setFilterDefinitions(): Promise<void> {
        if (!this.filterListData.filterDefinitions) {
            return;
        }

        const nextDefinitions = this.getFilterDefinitions();

        let storedFilters: OsFilter<V>[] = [];
        if (!this.historyService.isInHistoryMode()) {
            storedFilters = await this.store.get<OsFilter<V>[]>(`filter_` + this.filterListData.storageKey);
        }

        if (!(storedFilters && storedFilters.length && nextDefinitions && nextDefinitions.length)) {
            return;
        }

        for (const nextDefinition of nextDefinitions) {
            nextDefinition.count = this.baseFilterListService.getCountForFilterOptions(nextDefinition, storedFilters);
        }

        this.filterListData.filterDefinitions = nextDefinitions ?? []; // Prevent being null or undefined
        this.storeActiveFilters();
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
            this.store.set(`filter_` + this.filterListData.storageKey, this.filterListData.filterDefinitions);
        }
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
     * Applies current filters in {@link filterDefinitions} to the {@link inputData} list
     * and publishes the filtered data to the observable {@link outputSubject}
     */
    public updateFilteredData(): void {
        let filteredData: V[] = [];
        if (this.filterListData.inputData) {
            const preFilteredList = this.preFilter(this.filterListData.inputData);
            if (preFilteredList) {
                this.filterListData.inputData = preFilteredList;
            }

            if (!this.filterListData.filterDefinitions || !this.filterListData.filterDefinitions.length) {
                filteredData = this.filterListData.inputData;
            } else {
                filteredData = this.filterListData.inputData.filter(item =>
                    this.filterListData.filterDefinitions.every(filter => !filter.count || this.baseFilterListService.isPassingFilter(item, filter))
                );
            }
        }

        this.filterListData.outputSubject.next(filteredData);
        this.baseFilterListService.activeFiltersToStack(this.filterListData);
    }

    /**
     * Removes all active options of a given filter, clearing it
     *
     * @param filter
     * @param update
     */
    private clearFilter(filter: OsFilter<V>, update: boolean = true): void {
        filter.options.forEach(option => {
            if (typeof option === `object` && option.isActive) {
                this.baseFilterListService.removeFilterOption(filter.property, option, this.filterListData);
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
        if (this.filterListData.filterDefinitions && this.filterListData.filterDefinitions.length) {
            this.filterListData.filterDefinitions.forEach(filter => {
                this.clearFilter(filter, false);
            });
            this.storeActiveFilters();
        }
    }
}
