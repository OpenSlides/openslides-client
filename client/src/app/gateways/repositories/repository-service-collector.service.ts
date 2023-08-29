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

    constructor(
        public DS: DataStoreService,
        public actionService: ActionService,
        public collectionMapperService: CollectionMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public translate: TranslateService,
        public relationManager: RelationManagerService // public errorService: ErrorService
    ) {}

    public registerNewKeyUpdates(collection: string, newKeys: string[]): void {
        if (this.collectionToKeyUpdatesObservableMap[collection]) {
            this.collectionToKeyUpdatesObservableMap[collection].next(newKeys);
        } else {
            this.collectionToKeyUpdatesObservableMap[collection] = new BehaviorSubject(newKeys);
        }
    }

    public getNewKeyUpdatesObservable(collection: string): Observable<string[]> {
        if (!this.collectionToKeyUpdatesObservableMap[collection]) {
            this.collectionToKeyUpdatesObservableMap[collection] = new BehaviorSubject([]);
        }
        return this.collectionToKeyUpdatesObservableMap[collection];
    }
}
