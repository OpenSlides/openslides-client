import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
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
        }
    ]
};

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    protected operator: OperatorService;

    public constructor() {
        super();

        this.operator = inject(OperatorService);
    }

    protected override async onShouldCreateModelRequests(): Promise<void> {
        await this.operator.ready;
        this.subscribeTo(
            this.getAccountSubscriptionForCurrentPerm(this.operator.hasOrganizationPermissions(OML.can_manage_users)),
            { hideWhenMeetingChanged: true }
        );
        this.operator.userObservable
            .pipe(
                map(user => user && !!user?.organization_management_level),
                distinctUntilChanged()
            )
            .subscribe(hasOrgaRights => {
                this.updateSubscribeTo(this.getAccountSubscriptionForCurrentPerm(hasOrgaRights), {
                    hideWhenMeetingChanged: true
                });
            });
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
