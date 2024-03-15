import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { RelationManagerService } from 'src/app/site/services/relation-manager.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { ActiveMeetingService } from './active-meeting.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Injectable({
    providedIn: `root`
})
export class MeetingControllerServiceCollectorService {
    public get translate(): TranslateService {
        return this.controllerServiceCollector.translate;
    }

    public get DS(): DataStoreService {
        return this.controllerServiceCollector.DS;
    }

    public get relationManager(): RelationManagerService {
        return this.controllerServiceCollector.relationManager;
    }

    public get viewModelStoreService(): ViewModelStoreService {
        return this.controllerServiceCollector.viewModelStoreService;
    }

    public constructor(
        private controllerServiceCollector: ControllerServiceCollectorService,
        public activeMeetingIdService: ActiveMeetingIdService,
        public activeMeetingService: ActiveMeetingService,
        public collectionMapperService: MeetingCollectionMapperService,
        public meetingSettingsService: MeetingSettingsService
    ) {}
}
