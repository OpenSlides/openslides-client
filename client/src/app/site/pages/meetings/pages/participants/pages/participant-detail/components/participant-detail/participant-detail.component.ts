import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { getGenderListSubscriptionConfig } from 'src/app/site/pages/organization/pages/accounts/pages/gender/gender.subscription';

import { getParticipantDetailSubscription } from '../../../../participants.subscription';

@Component({
    selector: `os-participant-detail`,
    templateUrl: `./participant-detail.component.html`,
    styleUrls: [`./participant-detail.component.scss`]
})
export class ParticipantDetailComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(params?: any): void {
        if (params[`id`]) {
            this.subscribeTo(getParticipantDetailSubscription(+params[`id`]), { hideWhenDestroyed: true });
        }
        this.subscribeTo(getGenderListSubscriptionConfig());
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] && params[`id`] !== oldParams[`id`]) {
            this.updateSubscribeTo(getParticipantDetailSubscription(+params[`id`]), { hideWhenDestroyed: true });
        }
    }
}
