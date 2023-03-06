import { Component } from '@angular/core';
import { map } from 'rxjs';
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
                                follow: [{ idField: `meeting_user_ids`, additionalFields: [`group_ids`] }]
                            }
                        ]
                    },
                    subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`,
                    hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
                },
                ...additionalRequests
            ],
            { hideWhenMeetingChanged: true }
        );
    }
}
