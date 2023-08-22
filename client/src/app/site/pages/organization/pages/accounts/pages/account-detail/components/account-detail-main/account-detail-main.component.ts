import { Component } from '@angular/core';
import { filter, firstValueFrom, map } from 'rxjs';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/organization.subscription';

import { getAccountDetailSubscriptionConfig } from '../../../../accounts.subscription';

@Component({
    selector: `os-account-detail-main`,
    templateUrl: `./account-detail-main.component.html`,
    styleUrls: [`./account-detail-main.component.scss`]
})
export class AccountDetailMainComponent extends BaseModelRequestHandlerComponent {
    public constructor() {
        super();
        firstValueFrom(
            this.router.events.pipe(
                map(() => this.router.url.includes(`meetings`)),
                filter(isAddToMeetings => isAddToMeetings)
            )
        ).then(() => {
            this.subscribeTo(getMeetingListSubscriptionConfig());
        });
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`]) {
            const id = +params[`id`];
            this.subscribeTo(getAccountDetailSubscriptionConfig(id), { hideWhenDestroyed: true });
        }
    }
}
