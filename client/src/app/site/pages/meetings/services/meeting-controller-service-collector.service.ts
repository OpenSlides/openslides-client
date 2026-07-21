import { inject, Service } from '@angular/core';
import { ControllerServiceCollectorService } from '@app/site/services/controller-service-collector.service';
import { DataStoreService } from '@app/site/services/data-store.service';
import { RelationManagerService } from '@app/site/services/relation-manager.service';
import { ViewModelStoreService } from '@app/site/services/view-model-store.service';
import { TranslateService } from '@ngx-translate/core';

import { ActiveMeetingService } from './active-meeting.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Service()
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

    private controllerServiceCollector = inject(ControllerServiceCollectorService);
    public activeMeetingIdService = inject(ActiveMeetingIdService);
    public activeMeetingService = inject(ActiveMeetingService);
    public collectionMapperService = inject(MeetingCollectionMapperService);
    public meetingSettingsService = inject(MeetingSettingsService);
}
