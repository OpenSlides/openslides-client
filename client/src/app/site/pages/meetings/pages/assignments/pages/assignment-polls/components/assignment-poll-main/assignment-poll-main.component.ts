import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getParticipantMinimalSubscriptionConfig } from '../../../../../participants/participants.subscription';
import { getPollDetailSubscriptionConfig } from '../../../../../polls/polls.subscription';

@Component({
    selector: `os-assignment-poll-main`,
    templateUrl: `./assignment-poll-main.component.html`,
    styleUrls: [`./assignment-poll-main.component.scss`]
})
export class AssignmentPollMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] && params[`id`] !== oldParams[`id`]) {
            this.subscribeTo(getPollDetailSubscriptionConfig(+params[`id`]), { hideWhenDestroyed: true });
            this.subscribeTo(getParticipantMinimalSubscriptionConfig(+params[`meetingId`]), {
                hideWhenDestroyed: true
            });
        }
    }
}
