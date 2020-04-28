import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { CollectionStringMapperService } from '../core-services/collection-string-mapper.service';
import { DataSendService } from '../core-services/data-send.service';
import { DataStoreService } from '../core-services/data-store.service';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';

@Injectable({
    providedIn: 'root'
})
export class RepositoryServiceCollector {
    public constructor(
        public DS: DataStoreService,
        public dataSend: DataSendService,
        public collectionStringMapperService: CollectionStringMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public translate: TranslateService,
        public relationManager: RelationManagerService
    ) {}
}
