import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { ModelRequestService } from '../core-services/model-request.service';
import { StorageService } from '../core-services/storage.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Injectable({
    providedIn: `root`
})
export class ComponentServiceCollector {
    public constructor(
        public titleService: Title,
        public matSnackBar: MatSnackBar,
        public storage: StorageService,
        public modelRequestService: ModelRequestService,
        public meetingSettingService: MeetingSettingsService,
        public activeMeetingIdService: ActiveMeetingIdService,
        public activeMeetingService: ActiveMeetingService
    ) {}
}
