import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { MeetingComponentServiceCollectorService } from '../services/meeting-component-service-collector.service';

@Directive()
export abstract class BaseMeetingListViewComponent<V extends BaseViewModel> extends BaseListViewComponent<V> {
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
