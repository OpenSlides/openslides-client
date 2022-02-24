import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { ModelRequestService } from '../core-services/model-request.service';
import { SequentialNumberMappingService } from '../core-services/sequential-number-mapping.service';
import { StorageService } from '../core-services/storage.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Injectable({
    providedIn: `root`
})
export class ComponentServiceCollector {
    public constructor(
        public readonly titleService: Title,
        public readonly matSnackBar: MatSnackBar,
        public readonly storage: StorageService,
        public readonly modelRequestService: ModelRequestService,
        public readonly meetingSettingService: MeetingSettingsService,
        public readonly activeMeetingIdService: ActiveMeetingIdService,
        public readonly activeMeetingService: ActiveMeetingService,
        public readonly sequentialNumberMappingService: SequentialNumberMappingService
    ) {}
}
