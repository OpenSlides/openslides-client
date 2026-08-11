import { inject, Service } from '@angular/core';
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
    public translate = inject(TranslateService);
    public DS = inject(DataStoreService);
    public relationManager = inject(RelationManagerService);
    public viewModelStoreService = inject(ViewModelStoreService);

    public activeMeetingIdService = inject(ActiveMeetingIdService);
    public activeMeetingService = inject(ActiveMeetingService);
    public collectionMapperService = inject(MeetingCollectionMapperService);
    public meetingSettingsService = inject(MeetingSettingsService);
}
