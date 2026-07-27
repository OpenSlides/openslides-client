import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from '@app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getAmendmentListSubscriptionConfig } from '../../../../motions.subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./amendment-list-main.component.html`,
    styleUrls: [`./amendment-list-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AmendmentListMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAmendmentListSubscriptionConfig(id)];
    }
}
