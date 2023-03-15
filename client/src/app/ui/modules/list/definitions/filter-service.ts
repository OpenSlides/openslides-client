import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { OsFilter, OsFilterIndicator, OsFilterOption } from 'src/app/site/base/base-filter.service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';
export interface FilterListService<V extends Identifiable> extends ViewModelListProvider<V> {
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
