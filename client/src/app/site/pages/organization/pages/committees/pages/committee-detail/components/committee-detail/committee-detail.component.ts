import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/organization.subscription';

import { getCommitteeDetailSubscriptionConfig } from '../../../../committees.subscription';

@Component({
    selector: `os-committee-detail`,
    templateUrl: `./committee-detail.component.html`,
    styleUrls: [`./committee-detail.component.scss`]
})
export class CommitteeDetailComponent extends BaseModelRequestHandlerComponent {
    private committeeId: Id | null = null;

    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [getMeetingListSubscriptionConfig(() => this.getNextMeetingIdObservable())];
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`committeeId`] !== oldParams[`committeeId`]) {
            this.committeeId = +params[`committeeId`] || null;
            this.subscribeTo(getCommitteeDetailSubscriptionConfig(this.committeeId));
        }
    }
}
