import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

const ACCOUNT_DETAIL_SUBSCRIPTION_NAME = `account_detail`;

@Component({
    selector: `os-account-detail-main`,
    templateUrl: `./account-detail-main.component.html`,
    styleUrls: [`./account-detail-main.component.scss`]
})
export class AccountDetailMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`]) {
            const id = +params[`id`];
            this.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewUser,
                    ids: [id],
                    fieldset: `accountList`,
                    follow: [
                        `committee_ids`,
                        { idField: `meeting_ids`, additionalFields: [`committee_id`] } // , `committee_$_management_level`
                    ]
                },
                subscriptionName: ACCOUNT_DETAIL_SUBSCRIPTION_NAME,
                hideWhenDestroyed: true
            });
        }
    }
}
