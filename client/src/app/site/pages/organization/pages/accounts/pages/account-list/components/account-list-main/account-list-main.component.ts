import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMeetingUserIdsSubscriptionConfig } from '../../../../accounts.subscription';

@Component({
    selector: `os-account-list-main`,
    templateUrl: `./account-list-main.component.html`,
    styleUrls: [`./account-list-main.component.scss`],
    standalone: false
})
export class AccountListMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(params?: any): void {
        if (params[`id`] || params[`meetingId`]) {
            this.subscribeTo(getMeetingUserIdsSubscriptionConfig(+(params[`id`] || params[`meetingId`])), {
                hideWhenDestroyed: true
            });
        }
    }

    protected override onParamsChanged(params: any): void {
        if (params[`id`] || params[`meetingId`]) {
            this.updateSubscribeTo(getMeetingUserIdsSubscriptionConfig(+(params[`id`] || params[`meetingId`])), {
                hideWhenDestroyed: true
            });
        }
    }
}
