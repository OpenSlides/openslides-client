import { BehaviorSubject, Observable, Subscription } from 'rxjs';

/**
 * Describes the available filters for a listView.
 * @param property: the ViewModel's property or method to filter by
 * @param label: An optional, different label (if not present, the property will be used)
 * @param options a list of available options for a filter
 * @param count
 */
export interface OsFilter<V> {
    property: keyof V;
    label?: string;
    options: OsFilterOptions;
    count?: number;
}

/**
 * The type of all filter options. This is an array of options. One option
 * can be OsFilterOption or a string.
 */
export type OsFilterOptions = (OsFilterOption | string)[];

/**
 * Describes a list of available options for a drop down menu of a filter.
 * A filter condition of null will be interpreted as a negative filter
 * ('None of the other filter options').
 * Filter condition numbers/number arrays will be checked against numerical
 * values and as id(s) for objects.
 */
export interface OsFilterOption {
    label: string;
    condition: OsFilterOptionCondition | null;
    isActive?: boolean;
    isChild?: boolean;
    children?: OsFilterOption[];
}

/**
 * Unique indicated filter with a label and a filter option
 */
export interface OsFilterIndicator<V> {
    property: keyof V;
    option: OsFilterOption;
}

/**
 * Define the type of a filter condition
 */
type OsFilterOptionCondition = OsFilterOptionConditionType | OsFilterOptionConditionType[];

type OsFilterOptionConditionType = null | string | boolean | number;

export interface FilterListService<V> {
    filterListData: FilterListData<V>;
    readonly unfilteredCount: number;
    readonly filterCount: number;
    readonly hasFilterOptions: boolean;
    readonly filterDefinitions: OsFilter<V>[];
    readonly filterStack: OsFilterIndicator<V>[];
    readonly outputObservable: Observable<V[]>;
    getFilterName(filter: OsFilter<V>): string;
    toggleFilterOption(property: keyof V, option: OsFilterOption, info?: FilterListData<V>): void;
    clearAllFilters(info?: FilterListData<V>): void;
    initFilters(inputObservable: Observable<V[]>, info?: FilterListData<V>): void;
}

export interface FilterListData<V> {
    /**
    * stores the currently used raw data to be used for the filter
    */
    inputData: V[];

    /**
     * Subscription for the inputData list.
     * Acts as an semaphore for new filtered data
     */
    inputDataSubscription: Subscription | null;

    /**
     * The currently used filters.
     */
    filterDefinitions: OsFilter<V>[];

    /**
     * The observable output for the filtered data
     */
    outputSubject: BehaviorSubject<V[]>;

    /**
     * Stack OsFilters
     */
    filterStack: OsFilterIndicator<V>[];

    /**
     * The key to access stored valued
     */
    storageKey: string;
}

export class FilterListData<V>{

    public inputData: V[] = [];
    public inputDataSubscription: Subscription | null = null;
    public filterDefinitions: OsFilter<V>[] = [];
    public outputSubject = new BehaviorSubject<V[]>([]);
    public filterStack: OsFilterIndicator<V>[] = [];
    public storageKey: string;

    public constructor(storageKey: string = ``) {
        this.storageKey = storageKey;
    };

    /**
     * @returns the total count of items before the filter
     */
    public get unfilteredCount(): number {
        return this.inputData ? this.inputData.length : 0;
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
}
