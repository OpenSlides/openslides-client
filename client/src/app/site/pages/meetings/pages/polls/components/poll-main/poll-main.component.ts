import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { BaseModelRequestHandlerComponent } from '@app/site/base/base-model-request-handler.component';

import { getPollDetailSubscriptionConfig, getPollListSubscriptionConfig } from '../../polls.subscription';

@Component({
    selector: `os-poll-main`,
    templateUrl: `./poll-main.component.html`,
    styleUrls: [`./poll-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PollMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] && +params[`id`]) {
            this.updateSubscribeTo(getPollDetailSubscriptionConfig(+params[`id`]), {
                hideWhenDestroyed: true
            });
        }

        if (!params[`id`]) {
            this.updateSubscribeTo(getPollListSubscriptionConfig(params[`meetingId`]), {
                hideWhenMeetingChanged: true
            });
        }
    }

    protected override onShouldCreateModelRequests(params: any, meetingId: Id): void {
        if (+params[`id`]) {
            this.subscribeTo(getPollDetailSubscriptionConfig(+params[`id`]), { hideWhenDestroyed: true });
        } else {
            this.subscribeTo(getPollListSubscriptionConfig(meetingId), { hideWhenMeetingChanged: true });
        }
    }
}
