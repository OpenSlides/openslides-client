import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import {
    getParticipantListSubscriptionConfig,
    getSpeakersListSubscriptionConfig
} from '../../participants.subscription';
import { getStructureLevelListSubscriptionConfig } from '../../participants.subscription';

@Component({
    selector: `os-participant-main`,
    templateUrl: `./participant-main.component.html`,
    styleUrls: [`./participant-main.component.scss`],
    standalone: false
})
export class ParticipantMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [
            getParticipantListSubscriptionConfig(id),
            getStructureLevelListSubscriptionConfig(id),
            getSpeakersListSubscriptionConfig(id)
        ];
    }
}
