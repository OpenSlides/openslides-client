import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { Ids } from 'src/app/domain/definitions/key-types';
import { map } from 'rxjs';
import { AccountCommonService } from '../../services/account-common.service/account-common.service';
import { getCommitteeListSubscriptionConfig } from '../../../committees/config/model-subscription';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: 'os-account-main',
    templateUrl: './account-main.component.html',
    styleUrls: ['./account-main.component.scss']
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
                    fieldset: `accountList`
                },
                subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            },
            getCommitteeListSubscriptionConfig(() => this.getNextMeetingIdObservable())
        ];
    }
}
