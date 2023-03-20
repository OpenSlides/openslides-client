import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAssignmentListMinimalSubscriptionConfig } from '../../../assignments/assignments.subscription';
import { getMotionListMinimalSubscriptionConfig } from '../../../motions/motions.subscription';
import { getParticipantMinimalSubscriptionConfig } from '../../../participants/participants.subscription';

@Component({
    selector: `os-history-main`,
    templateUrl: `./history-main.component.html`,
    styleUrls: [`./history-main.component.scss`]
})
export class HistoryMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: Id | null): void {
        if (id) {
            this.subscribeTo(getMotionListMinimalSubscriptionConfig(id), { hideWhenDestroyed: true });
            this.subscribeTo(getParticipantMinimalSubscriptionConfig(id), { hideWhenDestroyed: true });
            this.subscribeTo(getAssignmentListMinimalSubscriptionConfig(id), { hideWhenDestroyed: true });
        }
    }
}
