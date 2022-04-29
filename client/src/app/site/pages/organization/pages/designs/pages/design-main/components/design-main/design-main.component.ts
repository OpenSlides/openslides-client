import { Component, OnInit } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { map } from 'rxjs';
import { THEME_LIST_SUBSCRIPTION } from 'src/app/site/pages/organization/pages/designs/view-models/view-theme';

@Component({
    selector: 'os-design-main',
    templateUrl: './design-main.component.html',
    styleUrls: ['./design-main.component.scss']
})
export class DesignMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewOrganization,
                    ids: [ORGANIZATION_ID],
                    follow: [`theme_ids`]
                },
                subscriptionName: THEME_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            }
        ];
    }
}
