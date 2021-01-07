import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { MeetingSettingsService } from './meeting-settings.service';
import { ModelRequestService } from '../core-services/model-request.service';
import { StorageService } from '../core-services/storage.service';

@Injectable({
    providedIn: 'root'
})
export class ComponentServiceCollector {
    public constructor(
        public titleService: Title,
        public translate: TranslateService,
        public matSnackBar: MatSnackBar,
        public storage: StorageService,
        public modelRequestService: ModelRequestService,
        public meetingSettingService: MeetingSettingsService
    ) {}
}
