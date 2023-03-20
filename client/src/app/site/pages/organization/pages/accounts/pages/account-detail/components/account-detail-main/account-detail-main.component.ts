import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAccountDetailSubscriptionConfig } from '../../../../accounts.subscription';

@Component({
    selector: `os-account-detail-main`,
    templateUrl: `./account-detail-main.component.html`,
    styleUrls: [`./account-detail-main.component.scss`]
})
export class AccountDetailMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`]) {
            const id = +params[`id`];
            this.subscribeTo(getAccountDetailSubscriptionConfig(id), { hideWhenDestroyed: true });
        }
    }
}
