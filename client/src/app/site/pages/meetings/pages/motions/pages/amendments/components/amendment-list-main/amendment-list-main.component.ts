import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAmendmentListSubscriptionConfig } from '../../../../motions.subscription';

@Component({
    selector: `os-motion-main`,
    templateUrl: `./amendment-list-main.component.html`,
    styleUrls: [`./amendment-list-main.component.scss`]
})
export class AmendmentListMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAmendmentListSubscriptionConfig(id), { hideWhenMeetingChanged: true });
        }
    }
}
