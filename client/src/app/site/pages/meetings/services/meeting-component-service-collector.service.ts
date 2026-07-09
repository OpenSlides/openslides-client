import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { StorageService } from '../../../../gateways/storage.service';
import { ComponentServiceCollectorService } from '../../../services/component-service-collector.service';
import { ModelRequestService } from '../../../services/model-request.service';
import { ActiveMeetingService } from './active-meeting.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { MeetingSettingsService } from './meeting-settings.service';

@Injectable({
    providedIn: `root`
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

    public activeMeetingIdService = inject(ActiveMeetingIdService);
    public activeMeetingService = inject(ActiveMeetingService);
    public meetingSettingsService = inject(MeetingSettingsService);
    private componentServiceCollector = inject(ComponentServiceCollectorService);
}
