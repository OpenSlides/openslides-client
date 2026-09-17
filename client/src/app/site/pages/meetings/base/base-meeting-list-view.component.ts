import { Directive, inject } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { BaseListViewComponent } from '@app/site/base/base-list-view.component';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';
import { TranslateService } from '@ngx-translate/core';

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

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.componentServiceCollector.activeMeetingIdService;
    }

    protected get activeMeetingService(): ActiveMeetingService {
        return this.componentServiceCollector.activeMeetingService;
    }

    public override componentServiceCollector = inject(MeetingComponentServiceCollectorService);
    protected override translate = inject(TranslateService);
}
