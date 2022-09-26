import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { COMMITTEE_DETAIL_SUBSCRIPTION } from 'src/app/domain/models/comittees/committee';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/config/model-subscription';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewCommittee } from '../../../../view-models';

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
            this.subscribeTo({
                hideWhenDestroyed: true,
                modelRequest: {
                    viewModelCtor: ViewCommittee,
                    ids: [this.committeeId!],
                    fieldset: DEFAULT_FIELDSET,
                    follow: [{ idField: `user_ids`, fieldset: `accountList` }]
                },
                subscriptionName: COMMITTEE_DETAIL_SUBSCRIPTION
            });
        }
    }
}
