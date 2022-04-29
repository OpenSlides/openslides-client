import { Component, OnInit } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { map } from 'rxjs';
import { MEETING_LIST_SUBSCRIPTION } from 'src/app/site/pages/meetings/view-models/view-meeting';

@Component({
    selector: 'os-dashboard-main',
    templateUrl: './dashboard-main.component.html',
    styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    follow: [
                        { idField: `active_meeting_ids`, fieldset: `list` },
                        { idField: `archived_meeting_ids`, fieldset: `list` },
                        { idField: `template_meeting_ids`, fieldset: `list` }
                    ]
                },
                subscriptionName: MEETING_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            }
        ];
    }
}
