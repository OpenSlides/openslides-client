import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/config/model-subscription';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { ORGANIZATION_ID } from '../../../../services/organization.service';
import { ViewOrganization } from '../../../../view-models/view-organization';
import { getCommitteeListSubscriptionConfig } from '../../../committees/config/model-subscription';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    public constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    protected override onCreateModelRequests(firstCreation = true): ModelRequestConfig[] {
        const additionalRequests = firstCreation
            ? [
                  getCommitteeListSubscriptionConfig(() => this.getNextMeetingIdObservable()),
                  getMeetingListSubscriptionConfig(() => this.getNextMeetingIdObservable())
              ]
            : [];
        return [
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
        ];
    }
}
