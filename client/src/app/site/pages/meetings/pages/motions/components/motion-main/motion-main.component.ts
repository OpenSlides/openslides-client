import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAgendaSubscriptionConfig } from '../../../agenda/config/model-subscription';
import {
    getMotionBlockSubscriptionConfig,
    getMotionListSubscriptionConfig,
    getMotionsSubmodelSubscriptionConfig,
    getMotionWorkflowSubscriptionConfig
} from '../../config/model-subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./motion-main.component.html`,
    styleUrls: [`./motion-main.component.scss`]
})
export class MotionMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.updateSubscribeTo(
                getMotionListSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionBlockSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionWorkflowSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getMotionsSubmodelSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getAgendaSubscriptionConfig(id, () => this.getNextMeetingIdObservable())
            );
        }
    }
}
