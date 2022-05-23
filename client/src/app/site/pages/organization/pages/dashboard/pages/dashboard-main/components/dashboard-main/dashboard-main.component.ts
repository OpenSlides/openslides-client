import { Component } from '@angular/core';
import { map } from 'rxjs';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { MEETING_LIST_SUBSCRIPTION } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

@Component({
    selector: `os-dashboard-main`,
    templateUrl: `./dashboard-main.component.html`,
    styleUrls: [`./dashboard-main.component.scss`]
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
