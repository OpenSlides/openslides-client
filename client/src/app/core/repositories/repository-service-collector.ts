import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ActionService } from '../core-services/action.service';
import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import { DataStoreService } from '../core-services/data-store.service';
import { ErrorService } from '../ui-services/error.service';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from './repository-service-collector-without-active-meeting-service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';

@Injectable({
    providedIn: 'root'
})
export class RepositoryServiceCollector extends RepositoryServiceCollectorWithoutActiveMeetingService {
    public constructor(
        DS: DataStoreService,
        actionService: ActionService,
        collectionMapperService: CollectionMapperService,
        viewModelStoreService: ViewModelStoreService,
        translate: TranslateService,
        relationManager: RelationManagerService,
        errorService: ErrorService,
        public activeMeetingService: ActiveMeetingService
    ) {
        super(
            DS,
            actionService,
            collectionMapperService,
            viewModelStoreService,
            translate,
            relationManager,
            errorService
        );
    }
}
