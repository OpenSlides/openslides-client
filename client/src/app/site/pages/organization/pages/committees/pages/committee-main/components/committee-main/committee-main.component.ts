import { Component, OnInit } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { COMMITTEE_LIST_SUBSCRIPTION } from 'src/app/domain/models/comittees/committee';
import { map } from 'rxjs';
import { ORGANIZATION_TAG_LIST_SUBSCRIPTION } from 'src/app/domain/models/organization-tags/organization-tag';
import { ViewCommittee } from '../../../../view-models/view-committee';
import { ViewOrganizationTag } from '../../../../../organization-tags/view-models/view-organization-tag';

@Component({
    selector: 'os-committee-main',
    templateUrl: './committee-main.component.html',
    styleUrls: ['./committee-main.component.scss']
})
export class CommitteeMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    fieldset: [],
                    follow: [{ idField: `committee_ids`, fieldset: `list` }],
                    lazyLoad: {
                        ownViewModelCtor: ViewCommittee,
                        keyOfParent: `committee_ids`,
                        specificId: ORGANIZATION_ID,
                        fieldset: `list`
                    }
                },
                subscriptionName: COMMITTEE_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            },
            {
                subscriptionName: ORGANIZATION_TAG_LIST_SUBSCRIPTION,
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    follow: [`organization_tag_ids`],
                    lazyLoad: {
                        ownViewModelCtor: ViewOrganizationTag,
                        keyOfParent: `organization_tag_ids`,
                        specificId: ORGANIZATION_ID
                    }
                },
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            }
        ];
    }
}
