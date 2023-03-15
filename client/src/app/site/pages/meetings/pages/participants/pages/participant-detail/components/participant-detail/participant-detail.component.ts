import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getParticipantDetailSubscription } from '../../../../participants.subscription';

@Component({
    selector: `os-participant-detail`,
    templateUrl: `./participant-detail.component.html`,
    styleUrls: [`./participant-detail.component.scss`]
})
export class ParticipantDetailComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`]) {
            this.subscribeTo(getParticipantDetailSubscription(+params[`id`]));
        }
    }
}
