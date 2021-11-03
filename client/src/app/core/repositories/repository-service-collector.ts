import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ActionService } from '../core-services/action.service';
import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import { DataStoreService } from '../core-services/data-store.service';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';
import { ErrorService } from '../ui-services/error.service';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from './repository-service-collector-without-active-meeting-service';

@Injectable({
    providedIn: `root`
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
        public activeMeetingIdService: ActiveMeetingIdService
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
