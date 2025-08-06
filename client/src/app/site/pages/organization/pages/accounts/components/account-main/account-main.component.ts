import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { distinctUntilChanged, map, skip } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/organization.subscription';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ORGANIZATION_ID } from '../../../../services/organization.service';
import { ViewOrganization } from '../../../../view-models/view-organization';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

const accountListSubsciptionContent = {
    idField: `user_ids`,
    fieldset: `accountList`,
    follow: [
        {
            idField: `meeting_user_ids`,
            fieldset: `groups`,
            follow: [
                {
                    idField: `meeting_id`,
                    fieldset: [`is_active_in_organization_id`, `is_archived_in_organization_id`, `default_group_id`],
                    follow: [{ idField: `committee_id`, fieldset: [`manager_ids`] }]
                }
            ]
        },
        {
            idField: `gender_id`,
            fieldset: [`name`]
        },
        {
            idField: `home_committee_id`,
            fieldset: [`name`]
        }
    ]
};

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`],
    standalone: false
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    protected operator: OperatorService = inject(OperatorService);

    protected override async onBeforeModelRequests(): Promise<void> {
        await this.operator.ready;
    }

    protected override async onShouldCreateModelRequests(): Promise<void> {
        this.subscribeTo(
            this.getAccountSubscriptionForCurrentPerm(this.operator.hasOrganizationPermissions(OML.can_manage_users)),
            { hideWhenMeetingChanged: true }
        );

        this.subscribeTo(getMeetingListSubscriptionConfig(), { hideWhenMeetingChanged: true });

        this.subscriptions.push(
            this.operator.userObservable
                .pipe(
                    map(user => user && !!user?.organization_management_level),
                    distinctUntilChanged(),
                    skip(1)
                )
                .subscribe(hasOrgaRights => {
                    this.updateSubscribeTo(this.getAccountSubscriptionForCurrentPerm(hasOrgaRights), {
                        hideWhenMeetingChanged: true
                    });
                })
        );
    }

    private getAccountSubscriptionForCurrentPerm(isUserAdmin: boolean): any {
        if (isUserAdmin) {
            return [
                {
                    modelRequest: {
                        viewModelCtor: ViewOrganization,
                        ids: [ORGANIZATION_ID],
                        follow: [
                            accountListSubsciptionContent,
                            {
                                idField: `committee_ids`,
                                fieldset: [`name`],
                                follow: [
                                    {
                                        idField: `meeting_ids`,
                                        fieldset: [`name`]
                                    }
                                ]
                            },
                            {
                                idField: `gender_ids`,
                                fieldset: [`name`]
                            }
                        ]
                    },
                    subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}`
                }
            ];
        }
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewUser,
                    ids: [this.operator.operatorId],
                    follow: [
                        {
                            idField: `committee_management_ids`,
                            fieldset: [`name`, `manager_ids`],
                            follow: [
                                accountListSubsciptionContent,
                                {
                                    idField: `meeting_ids`,
                                    fieldset: [`name`]
                                },
                                {
                                    idField: `all_child_ids`,
                                    fieldset: [`name`, `manager_ids`],
                                    follow: [
                                        accountListSubsciptionContent,
                                        {
                                            idField: `meeting_ids`,
                                            fieldset: [`name`]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                subscriptionName: `committee_manager_${ACCOUNT_LIST_SUBSCRIPTION}`
            }
        ];
    }
}
