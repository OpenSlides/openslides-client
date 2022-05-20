import { Component } from '@angular/core';
import { map } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { COMMITTEE_DETAIL_SUBSCRIPTION } from 'src/app/domain/models/comittees/committee';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { MEETING_LIST_SUBSCRIPTION } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
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
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    follow: [
                        { idField: `active_meeting_ids`, fieldset: `list` },
                        { idField: `archived_meeting_ids`, fieldset: `list` }
                    ]
                },
                subscriptionName: MEETING_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            }
        ];
    }

    protected override onParamsChanged(params: any): void {
        if (params[`committeeId`]) {
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
