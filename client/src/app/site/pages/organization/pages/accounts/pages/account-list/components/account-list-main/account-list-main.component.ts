import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMeetingUserIdsSubscriptionConfig } from '../../../../accounts.subscription';

@Component({
    selector: `os-account-list-main`,
    templateUrl: `./account-list-main.component.html`,
    styleUrls: [`./account-list-main.component.scss`]
})
export class AccountListMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(params?: any): void {
        if (params[`id`]) {
            this.subscribeTo(getMeetingUserIdsSubscriptionConfig(+params[`id`]), {
                hideWhenDestroyed: true
            });
        }
    }

    protected override onParamsChanged(params: any): void {
        if (params[`id`]) {
            this.updateSubscribeTo(getMeetingUserIdsSubscriptionConfig(+params[`id`]), {
                hideWhenDestroyed: true
            });
        }
    }
}
