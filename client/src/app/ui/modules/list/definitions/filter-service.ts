import { Observable } from 'rxjs';

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
    readonly unfilteredCount: number;
    readonly filterCount: number;
    readonly hasFilterOptions: boolean;
    readonly filterStack: OsFilterIndicator<V>[];
    readonly outputObservable: Observable<V[]>;
    readonly filterDefinitionsObservable: Observable<OsFilter<V>[]>;
    getFilterName(filter: OsFilter<V>): string;
    toggleFilterOption(property: keyof V, option: OsFilterOption): void;
    clearAllFilters(): void;
    initFilters(inputObservable: Observable<V[]>): void;
}

/**
 * Handles the saving and loading of filter definitions in the local storage.
 * Concrete implementations may specify conditions under which nothing will happen
 *
 * @param storageKey the key under which the definitions should be stored
 * @param filterDefinitions the data
 */
export interface ActiveFiltersStoreService {
    save<V>(storageKey: string, filterDefinitions: OsFilter<V>[]): Promise<void>;
    load<V>(storageKey: string): Promise<OsFilter<V>[] | null>;
}
