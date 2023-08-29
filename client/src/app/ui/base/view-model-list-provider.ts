import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';

export interface ViewModelListProvider<V extends Identifiable> {
    getViewModelListObservable(): Observable<V[]>;
    getSortedViewModelListObservable?: () => Observable<V[]>;
}

interface SortedViewModelListProvider<V extends Identifiable> {
    getSortedViewModelListObservable(): Observable<V[]>;
}

export type OptionalSortedViewModelListProvider<V extends Identifiable> =
    | SortedViewModelListProvider<V>
    | Record<string, never>;
