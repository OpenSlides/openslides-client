import { Identifiable } from '@app/domain/interfaces';
import { Observable } from 'rxjs';

export interface ViewModelListProvider<V extends Identifiable> {
    getViewModelListObservable(): Observable<V[]>;
    getSortedViewModelListObservable?: (key?: string) => Observable<V[]>;
}
