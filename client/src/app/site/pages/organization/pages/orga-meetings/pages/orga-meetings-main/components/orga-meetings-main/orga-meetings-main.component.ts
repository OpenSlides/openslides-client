import { Component } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/config/model-subscription';

@Component({
    selector: `os-orga-meetings-main`,
    templateUrl: `./orga-meetings-main.component.html`,
    styleUrls: [`./orga-meetings-main.component.scss`]
})
export class OrgaMeetingsMainComponent extends BaseModelRequestHandlerComponent {
    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [getMeetingListSubscriptionConfig(() => this.getNextMeetingIdObservable())];
    }
}
