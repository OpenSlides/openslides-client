import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionMapperService } from './collection-mapper.service';
import { DataStoreService } from './data-store.service';
import { RelationManagerService } from './relation-manager.service';
import { ViewModelStoreService } from './view-model-store.service';

@Injectable({
    providedIn: `root`
})
export class ControllerServiceCollectorService {
    public constructor(
        public translate: TranslateService,
        public readonly DS: DataStoreService,
        public collectionMapperService: CollectionMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public relationManager: RelationManagerService
    ) {}
}
