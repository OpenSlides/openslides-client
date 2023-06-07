import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import {
    getMotionBlockSubscriptionConfig,
    getMotionListSubscriptionConfig,
    getMotionsSubmodelSubscriptionConfig,
    getMotionWorkflowSubscriptionConfig
} from '../../motions.subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./motion-main.component.html`,
    styleUrls: [`./motion-main.component.scss`]
})
export class MotionMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.updateSubscribeTo(
                [
                    getMotionListSubscriptionConfig(id),
                    getMotionBlockSubscriptionConfig(id),
                    getMotionWorkflowSubscriptionConfig(id),
                    getMotionsSubmodelSubscriptionConfig(id)
                ],
                { hideWhenMeetingChanged: true }
            );
        }
    }
}
