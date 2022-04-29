import { Component, OnInit } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { map } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { Router } from '@angular/router';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

const ACCOUNT_LIST_SUBSCRIPTION = `account_list`;

let uniqueSubscriptionNumber = 0;

@Component({
    selector: 'os-account-list-main',
    templateUrl: './account-list-main.component.html',
    styleUrls: ['./account-list-main.component.scss']
})
export class AccountListMainComponent extends BaseModelRequestHandlerComponent {
    // private _accountIds: Ids = [];
    // public constructor(
    //     modelRequestService: ModelRequestService,
    //     router: Router,
    //     openslidesRouter: OpenSlidesRouterService,
    //     private controller: AccountControllerService
    // ) {
    //     super(modelRequestService, router, openslidesRouter);
    // }
    // protected override async onBeforeModelRequests(): Promise<void> {
    //     this._accountIds = await this.controller.fetchAccountIds();
    // }
    // protected override onCreateModelRequests(): void | ModelRequestConfig[] {
    //     return [
    //         {
    //             modelRequest: {
    //                 viewModelCtor: ViewUser,
    //                 ids: this._accountIds,
    //                 fieldset: `accountList`
    //             },
    //             subscriptionName: `${ACCOUNT_LIST_SUBSCRIPTION}_${uniqueSubscriptionNumber}`,
    //             hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !!id))
    //         }
    //     ];
    // }
}
