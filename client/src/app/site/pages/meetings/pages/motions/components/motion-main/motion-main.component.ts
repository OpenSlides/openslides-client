import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { getParticipantSubscriptionConfig } from '../../../participants/config/model-subscription';
import { getAgendaSubscriptionConfig } from '../../../agenda/config/model-subscription';
import { getMotionSubscriptionConfig } from '../../config/model-subscription';

const MOTION_LIST_SUBSCRIPTION = `motion_list`;

@Component({
    selector: 'os-motion-main',
    templateUrl: './motion-main.component.html',
    styleUrls: ['./motion-main.component.scss']
})
export class MotionMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(
                getMotionSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getParticipantSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getAgendaSubscriptionConfig(id, () => this.getNextMeetingIdObservable())
            );
        }
    }
}
