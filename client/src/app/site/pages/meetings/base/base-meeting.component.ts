import { Directive } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { AppInjector } from 'src/app/openslides-main-module/services/app-injector.service';
import { BaseComponent } from 'src/app/site/base/base.component';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { ViewMeeting } from '../view-models/view-meeting';

@Directive()
export abstract class BaseMeetingComponent extends BaseComponent {
    public get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    // Services which are injected manually to be available in all subclasses
    protected meetingSettingsService: MeetingSettingsService;
    protected activeMeetingIdService: ActiveMeetingIdService;
    protected activeMeetingService: ActiveMeetingService;

    public constructor() {
        super();
        const injector = AppInjector.getInjector();
        this.meetingSettingsService = injector.get(MeetingSettingsService);
        this.activeMeetingIdService = injector.get(ActiveMeetingIdService);
        this.activeMeetingService = injector.get(ActiveMeetingService);
    }
}
