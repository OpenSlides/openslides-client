import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMeetingListSubscriptionConfig } from '../../../../organization.subscription';
import { ORGANIZATION_ID } from '../../../../services/organization.service';
import { ViewOrganization } from '../../../../view-models/view-organization';
import { getCommitteeListSubscriptionConfig } from '../../../committees/committees.subscription';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    public constructor() {
        super();
    }

    protected override onShouldCreateModelRequests(firstCreation = true): void {
        const additionalRequests = firstCreation
            ? [getCommitteeListSubscriptionConfig(), getMeetingListSubscriptionConfig()]
            : [];

        this.subscribeTo(
            [
                {
                    modelRequest: {
                        viewModelCtor: ViewOrganization,
                        ids: [ORGANIZATION_ID],
                        follow: [
                            {
                                idField: `user_ids`,
                                fieldset: `accountList`,
                                follow: [{ idField: `meeting_user_ids`, fieldset: `groups` }]
                            }
                        ]
                    },
                    subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`
                },
                ...additionalRequests
            ],
            { hideWhenMeetingChanged: true }
        );
    }
}
