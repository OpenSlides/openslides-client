import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { map } from 'rxjs';
import { getAgendaSubscriptionConfig, getTopicSubscriptionConfig } from '../../config/model-subscription';
import { getMotionSubscriptionConfig } from '../../../motions/config/model-subscription';
import { getAssignmentSubscriptionConfig } from '../../../assignments/config/model-subscription';

@Component({
    selector: 'os-agenda-main',
    templateUrl: './agenda-main.component.html',
    styleUrls: ['./agenda-main.component.scss']
})
export class AgendaMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(
                getAgendaSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getTopicSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getAssignmentSubscriptionConfig(id, () => this.getNextMeetingIdObservable())
            );
        }
    }
}
