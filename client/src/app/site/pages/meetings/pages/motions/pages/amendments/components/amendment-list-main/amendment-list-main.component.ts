import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getAmendmentListSubscriptionConfig } from '../../../../motions.subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./amendment-list-main.component.html`,
    styleUrls: [`./amendment-list-main.component.scss`]
})
export class AmendmentListMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAmendmentListSubscriptionConfig(id)];
    }
}
