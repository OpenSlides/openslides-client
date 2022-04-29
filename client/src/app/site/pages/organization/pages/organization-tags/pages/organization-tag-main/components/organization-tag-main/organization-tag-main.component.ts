import { Component, OnInit } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ORGANIZATION_TAG_LIST_SUBSCRIPTION } from 'src/app/domain/models/organization-tags/organization-tag';
import { map } from 'rxjs';

@Component({
    selector: 'os-organization-tag-main',
    templateUrl: './organization-tag-main.component.html',
    styleUrls: ['./organization-tag-main.component.scss']
})
export class OrganizationTagMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    follow: [`organization_tag_ids`]
                },
                subscriptionName: ORGANIZATION_TAG_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            }
        ];
    }
}
