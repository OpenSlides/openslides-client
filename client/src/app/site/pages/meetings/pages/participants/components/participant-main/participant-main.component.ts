import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getParticipantListSubscriptionConfig } from '../../config/model-subscription';

@Component({
    selector: `os-participant-main`,
    templateUrl: `./participant-main.component.html`,
    styleUrls: [`./participant-main.component.scss`]
})
export class ParticipantMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getParticipantListSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
