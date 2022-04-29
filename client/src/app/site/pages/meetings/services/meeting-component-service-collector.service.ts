import { Injectable } from '@angular/core';
import { ComponentServiceCollectorService } from '../../../services/component-service-collector.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ActiveMeetingService } from './active-meeting.service';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../../../../gateways/storage.service';
import { MeetingSettingsService } from './meeting-settings.service';
import { ModelRequestService } from '../../../services/model-request.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class MeetingComponentServiceCollectorService {
    public get titleService(): Title {
        return this.componentServiceCollector.titleService;
    }
    public get matSnackBar(): MatSnackBar {
        return this.componentServiceCollector.matSnackBar;
    }
    public get storage(): StorageService {
        return this.componentServiceCollector.storage;
    }

    public get modelRequestService(): ModelRequestService {
        return this.componentServiceCollector.modelRequestService;
    }

    public get router(): Router {
        return this.componentServiceCollector.router;
    }

    constructor(
        private componentServiceCollector: ComponentServiceCollectorService,
        public activeMeetingIdService: ActiveMeetingIdService,
        public activeMeetingService: ActiveMeetingService,
        public meetingSettingsService: MeetingSettingsService
    ) {}
}
