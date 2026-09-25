import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';

import { BaseMeetingModelRequestHandler } from '../../../../base/base-meeting-model-request-handler.component';
import {
    getMotionBlockSubscriptionConfig,
    getMotionListSubscriptionConfig,
    getMotionsSubmodelSubscriptionConfig,
    getMotionWorkflowSubscriptionConfig
} from '../../motions.subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./motion-main.component.html`,
    styleUrls: [`./motion-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MotionMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [
            getMotionListSubscriptionConfig(id),
            getMotionBlockSubscriptionConfig(id),
            getMotionWorkflowSubscriptionConfig(id),
            getMotionsSubmodelSubscriptionConfig(id)
        ];
    }
}
