import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';

export interface ViewModelListProvider<V extends Identifiable> {
    getViewModelListObservable(): Observable<V[]>;
    getSortedViewModelListObservable?: () => Observable<V[]>;
}
