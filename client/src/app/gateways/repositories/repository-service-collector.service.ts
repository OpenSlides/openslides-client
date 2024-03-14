import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CollectionMapperService } from '../../site/services/collection-mapper.service';
import { DataStoreService } from '../../site/services/data-store.service';
import { RelationManagerService } from '../../site/services/relation-manager.service';
import { ViewModelStoreService } from '../../site/services/view-model-store.service';
import { ActionService } from '../actions';

@Injectable({
    providedIn: `root`
})
export class RepositoryServiceCollectorService {
    public collectionToKeyUpdatesObservableMap: { [collection: string]: BehaviorSubject<string[]> } = {};

    public constructor(
        public DS: DataStoreService,
        public actionService: ActionService,
        public collectionMapperService: CollectionMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public translate: TranslateService,
        public relationManager: RelationManagerService // public errorService: ErrorService
    ) {}

    /**
     * Allows repositories to register if there have been updates on a certain key of their model,
     * so other repositories can check them for the sake of their resorting logic
     * @param collection the calling repositories own collection
     * @param newKeys the keys that were updated in the repository
     */
    public registerNewKeyUpdates(collection: string, newKeys: string[]): void {
        if (this.collectionToKeyUpdatesObservableMap[collection]) {
            this.collectionToKeyUpdatesObservableMap[collection].next(newKeys);
        } else {
            this.collectionToKeyUpdatesObservableMap[collection] = new BehaviorSubject(newKeys);
        }
    }

    /**
     * Returns an observable that allows repositories to be notified when there are key updates on other model types
     * @param collection the collection of the other model type.
     * @returns an observable with the changed keys
     */
    public getNewKeyUpdatesObservable(collection: string): Observable<string[]> {
        if (!this.collectionToKeyUpdatesObservableMap[collection]) {
            this.collectionToKeyUpdatesObservableMap[collection] = new BehaviorSubject([]);
        }
        return this.collectionToKeyUpdatesObservableMap[collection];
    }
}
