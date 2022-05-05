import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionMapperService } from '../../site/services/collection-mapper.service';
import { DataStoreService } from '../../site/services/data-store.service';
import { RelationManagerService } from '../../site/services/relation-manager.service';
import { ViewModelStoreService } from '../../site/services/view-model-store.service';
import { ActionService } from '../actions';

@Injectable({
    providedIn: 'root'
})
export class RepositoryServiceCollectorService {
    constructor(
        public DS: DataStoreService,
        public actionService: ActionService,
        public collectionMapperService: CollectionMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public translate: TranslateService,
        public relationManager: RelationManagerService // public errorService: ErrorService
    ) {}
}
