import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/config/model-subscription';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { getCommitteeListSubscriptionConfig } from '../../../committees/config/model-subscription';
import { AccountCommonService } from '../../services/account-common.service/account-common.service';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    private _accountIds: Ids = [];

    public constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
        private controller: AccountCommonService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    protected override async onBeforeModelRequests(): Promise<void> {
        this._accountIds = await this.controller.fetchAccountIds();
    }

    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [
            {
                modelRequest: {
                    viewModelCtor: ViewUser,
                    ids: this._accountIds,
                    fieldset: `accountList`,
                    additionalFields: [{ templateField: `group_$_ids` }]
                },
                subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            },
            getCommitteeListSubscriptionConfig(() => this.getNextMeetingIdObservable()),
            getMeetingListSubscriptionConfig(() => this.getNextMeetingIdObservable())
        ];
    }
}
