import { Observable } from 'rxjs';
export type SortDefinition<T> = keyof T | OsSortDefinition<T>;

/**
 * Describes the sorting columns of an associated ListView, and their state.
 */
export interface OsSortDefinition<T> {
    sortProperty: keyof T;
    sortAscending: boolean;
}

/**
 * A sorting property (data may be a string, a number, a function, or an object
 * with a toString method) to sort after. Sorting will be done in {@link filterData}
 */
export interface OsSortOption<T> {
    property: keyof T;
    label?: string;
    sortFn?: (itemA: T, itemB: T, ascending: boolean, intl?: Intl.Collator) => number;
}

export interface SortService<V> {
    sortFn?: (a: V, b: V, ascending: boolean) => number;
}

export interface SortListService<V> extends SortService<V> {
    readonly sortOptions: OsSortOption<V>[];
    readonly outputObservable: Observable<V[]>;
    readonly isActive: boolean;
    sortProperty: keyof V;
    getSortIcon(option: OsSortOption<V>): string | null;
    getSortLabel(option: OsSortOption<V>): string;
    initSorting(inputObservable: Observable<V[]>): void;
}
