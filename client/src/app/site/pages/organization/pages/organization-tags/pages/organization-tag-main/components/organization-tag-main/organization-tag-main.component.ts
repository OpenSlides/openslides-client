import { Component } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';

import { getOrganizationTagListSubscriptionConfig } from '../../../../organization-tags.subscription';

@Component({
    selector: `os-organization-tag-main`,
    templateUrl: `./organization-tag-main.component.html`,
    styleUrls: [`./organization-tag-main.component.scss`]
})
export class OrganizationTagMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [getOrganizationTagListSubscriptionConfig(() => this.getNextMeetingIdObservable())];
    }
}
