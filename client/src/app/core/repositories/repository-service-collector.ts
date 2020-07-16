import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ActionService } from '../core-services/action.service';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import { DataStoreService } from '../core-services/data-store.service';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';
import { ActiveMeetingService } from '../core-services/active-meeting.service';

@Injectable({
    providedIn: 'root'
})
export class RepositoryServiceCollector {
    public constructor(
        public DS: DataStoreService,
        public actionService: ActionService,
        public collectionMapperService: CollectionMapperService,
        public viewModelStoreService: ViewModelStoreService,
        public translate: TranslateService,
        public relationManager: RelationManagerService,
        public activeMeetingService: ActiveMeetingService
    ) {}
}
