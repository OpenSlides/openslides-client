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
type OsFilterOptionCondition = string | boolean | number | number[];

export interface FilterListService<V> {
    readonly unfilteredCount: number;
    readonly filterCount: number;
    readonly hasFilterOptions: boolean;
    readonly filterDefinitions: OsFilter<V>[];
    readonly filterStack: OsFilterIndicator<V>[];
    readonly outputObservable: Observable<V[]>;
    getFilterName(filter: OsFilter<V>): string;
    toggleFilterOption(property: keyof V, option: OsFilterOption): void;
    clearAllFilters(): void;
    initFilters(inputObservable: Observable<V[]>): void;
}
