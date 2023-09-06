import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { ORGANIZATION_ID } from '../../../../services/organization.service';
import { ViewOrganization } from '../../../../view-models/view-organization';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    public constructor() {
        super();
    }

    protected override onShouldCreateModelRequests(): void {
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
                                follow: [
                                    {
                                        idField: `meeting_user_ids`,
                                        fieldset: `groups`,
                                        follow: [
                                            {
                                                idField: `meeting_id`,
                                                fieldset: [
                                                    `is_active_in_organization_id`,
                                                    `is_archived_in_organization_id`
                                                ],
                                                follow: [{ idField: `committee_id`, fieldset: [`manager_ids`] }]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                idField: `committee_ids`,
                                fieldset: [`name`],
                                follow: [
                                    {
                                        idField: `meeting_ids`,
                                        fieldset: [`name`]
                                    }
                                ]
                            }
                        ]
                    },
                    subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}`
                }
            ],
            { hideWhenMeetingChanged: true }
        );
    }
}
