import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';

import {
    getCommitteeDetailSubscriptionConfig,
    getCommitteeMeetingDetailExternalIdsSubscriptionConfig
} from '../../../../committees.subscription';

@Component({
    selector: `os-committee-detail`,
    templateUrl: `./committee-detail.component.html`,
    styleUrls: [`./committee-detail.component.scss`]
})
export class CommitteeDetailComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`committeeId`] !== oldParams[`committeeId`] && +params[`committeeId`]) {
            this.updateSubscribeTo(getCommitteeDetailSubscriptionConfig(+params[`committeeId`]), {
                hideWhenDestroyed: true
            });
        }
    }

    protected override onShouldCreateModelRequests(params: any): void {
        if (+params[`committeeId`]) {
            this.subscribeTo(getCommitteeDetailSubscriptionConfig(+params[`committeeId`]), { hideWhenDestroyed: true });
        }
        this.subscribeTo(getCommitteeMeetingDetailExternalIdsSubscriptionConfig());
    }
}
