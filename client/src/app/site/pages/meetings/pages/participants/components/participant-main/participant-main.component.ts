import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import {
    getParticipantListSubscriptionConfig,
    getSpeakersListSubscriptionConfig
} from '../../participants.subscription';
import { getStructureLevelListSubscriptionConfig } from '../../participants.subscription';

@Component({
    selector: `os-participant-main`,
    templateUrl: `./participant-main.component.html`,
    styleUrls: [`./participant-main.component.scss`]
})
export class ParticipantMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            // TODO: Do requests for speaker list and structure level list somewhere else
            this.subscribeTo(
                [
                    getParticipantListSubscriptionConfig(id),
                    getStructureLevelListSubscriptionConfig(id),
                    getSpeakersListSubscriptionConfig(id)
                ],
                {
                    hideWhenMeetingChanged: true
                }
            );
        }
    }
}
