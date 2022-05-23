import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAssignmentSubscriptionConfig } from '../../../assignments/config/model-subscription';
import {
    getMotionBlockSubscriptionConfig,
    getMotionListSubscriptionConfig
} from '../../../motions/config/model-subscription';
import { getAgendaSubscriptionConfig, getTopicSubscriptionConfig } from '../../config/model-subscription';

@Component({
    selector: `os-agenda-main`,
    templateUrl: `./agenda-main.component.html`,
    styleUrls: [`./agenda-main.component.scss`]
})
export class AgendaMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.updateSubscribeTo(
                getAgendaSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getTopicSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionListSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionBlockSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getAssignmentSubscriptionConfig(id, () => this.getNextMeetingIdObservable())
            );
        }
    }
}
