import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { USER_IDS_OBSERVABLE } from 'src/app/domain/models/users/user';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/config/model-subscription';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { getCommitteeListSubscriptionConfig } from '../../../committees/config/model-subscription';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: `os-account-main`,
    templateUrl: `./account-main.component.html`,
    styleUrls: [`./account-main.component.scss`]
})
export class AccountMainComponent extends BaseModelRequestHandlerComponent {
    private get accountIds(): Ids {
        return this._accountIds;
    }

    private set accountIds(ids: Ids) {
        this._accountIds = Array.from(new Set(this.accountIds.concat(ids)));
    }

    private _accountIds: Ids = [];

    public constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
        private controller: UserControllerService
    ) {
        super(modelRequestService, router, openslidesRouter);
        this.subscriptions.push(
            USER_IDS_OBSERVABLE.subscribe(ids => {
                this.accountIds = ids;
                this.update();
            })
        );
    }

    protected override async onBeforeModelRequests(): Promise<void> {
        this.accountIds = await this.controller.fetchAccountIds({
            cleanOldModels: true,
            start_index: 0,
            entries: 10000
        });
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
                    viewModelCtor: ViewUser,
                    ids: this._accountIds,
                    fieldset: `accountList`,
                    additionalFields: [{ templateField: `group_$_ids` }]
                },
                subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
            },
            ...additionalRequests
        ];
    }

    private async update(firstCreation = false): Promise<void> {
        this.accountIds = await this.controller.fetchAccountIds({ cleanOldModels: true });
        this.updateSubscribeTo(...this.onCreateModelRequests(firstCreation));
    }
}
