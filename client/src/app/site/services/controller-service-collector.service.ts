import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionMapperService } from './collection-mapper.service';
import { DataStoreService } from './data-store.service';
import { RelationManagerService } from './relation-manager.service';
import { ViewModelStoreService } from './view-model-store.service';

@Service()
export class ControllerServiceCollectorService {
    public translate = inject(TranslateService);
    public readonly DS = inject(DataStoreService);
    public collectionMapperService = inject(CollectionMapperService);
    public viewModelStoreService = inject(ViewModelStoreService);
    public relationManager = inject(RelationManagerService);
}
