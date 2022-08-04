export type SortDefinition<T> = keyof T | OsSortingDefinition<T>;

/**
 * Describes the sorting columns of an associated ListView, and their state.
 */
export interface OsSortingDefinition<T> {
    sortProperty: OsSortProperty<T>;
    sortAscending: boolean;
}

/**
 * A sorting property (data may be a string, a number, a function, or an object
 * with a toString method) to sort after. Sorting will be done in {@link filterData}
 */
export interface OsSortingOption<T> {
    property: OsSortProperty<T>;
    label?: string;
    sortFn?: (itemA: T, itemB: T, ascending: boolean, intl?: Intl.Collator) => number;
}

/**
 * An array of properties may be given to define secondary options
 *
 * For example: An array [`first_name`, `last_name`] will sort by first_name first
 * and if for two elements the values are the same, it will sort these two based on the last_name.
 */
export type OsSortProperty<T> = OsSortPropertyBase<T> | OsSortPropertyBase<T>[];
type OsSortPropertyBase<T> = keyof T;
