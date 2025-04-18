import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { getMeetingCreateSubscriptionConfig } from 'src/app/site/pages/organization/organization.subscription';

import { getCommitteeMeetingDetailSubscriptionConfig } from '../../../../../../committees.subscription';

@Component({
    selector: `os-committee-detail-meeting-main`,
    templateUrl: `./committee-detail-meeting-main.component.html`,
    styleUrls: [`./committee-detail-meeting-main.component.scss`],
    standalone: false
})
export class CommitteeDetailMeetingMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: Id | null): void {
        if (id) {
            this.updateSubscribeTo(getCommitteeMeetingDetailSubscriptionConfig(id), { hideWhenDestroyed: true });
        }
    }

    protected override onShouldCreateModelRequests(_params: any, meetingId: Id): void {
        this.subscribeTo(getMeetingCreateSubscriptionConfig());
        this.subscribeTo(getCommitteeMeetingDetailSubscriptionConfig(meetingId), { hideWhenDestroyed: true });
    }
}
