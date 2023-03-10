import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getPollListSubscriptionConfig } from '../../polls.subscription';

@Component({
    selector: `os-poll-main`,
    templateUrl: `./poll-main.component.html`,
    styleUrls: [`./poll-main.component.scss`]
})
export class PollMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getPollListSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
