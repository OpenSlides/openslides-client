import { Injectable } from '@angular/core';

import { ActiveMeetingService } from './active-meeting.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Injectable({
    providedIn: `root`
})
export class MeetingControllerServiceCollectorService {
    public constructor(
        public activeMeetingIdService: ActiveMeetingIdService,
        public activeMeetingService: ActiveMeetingService,
        public collectionMapperService: MeetingCollectionMapperService,
        public meetingSettingsService: MeetingSettingsService
    ) {}
}
