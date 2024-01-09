import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseComponent } from 'src/app/site/base/base.component';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingComponentServiceCollectorService } from '../services/meeting-component-service-collector.service';
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

    /**
     * @deprecated Typo: use `meetingSettingsService` instead
     */
    protected get meetingSettingService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.componentServiceCollector.activeMeetingIdService;
    }

    protected get activeMeetingService(): ActiveMeetingService {
        return this.componentServiceCollector.activeMeetingService;
    }

    public constructor(
        public override componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService
    ) {
        super();
    }
}
