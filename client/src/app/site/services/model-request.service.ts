import { Injectable } from '@angular/core';
import { AutoupdateService, ModelSubscription } from './autoupdate';
import { SimplifiedModelRequest } from './model-request-builder';
import { concatMap, Observable, of, Subscription, timer } from 'rxjs';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { Ids } from 'src/app/domain/definitions/key-types';
import { ModelRequestObject } from './model-request-builder';

export interface SubscribeToConfig {
    modelRequest: SimplifiedModelRequest;
    subscriptionName: string;
    hideWhen?: Observable<boolean> | null;
}

@Injectable({
    providedIn: 'root'
})
export class ModelRequestService {
    private _modelSubscriptionMap: { [requestFamilyName: string]: ModelSubscription } = {};
    private _observableSubscriptionMap: { [requestFamilyName: string]: Subscription } = {};

    public constructor(
        private autoupdateService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private DS: DataStoreService
    ) {}

    public async subscribeTo({ modelRequest, subscriptionName, hideWhen }: SubscribeToConfig): Promise<void> {
        if (this._modelSubscriptionMap[subscriptionName]) {
            console.warn(`A subscription already made for ${subscriptionName}. Aborting.`);
            return;
        }
        modelRequest.fieldset = modelRequest.fieldset || [];
        const request = await this.modelRequestBuilder.build(modelRequest);
        if (modelRequest.lazyLoad) {
            const parentModel = this.DS.get(modelRequest.viewModelCtor, modelRequest.lazyLoad.specificId);
            const availableIds = parentModel[modelRequest.lazyLoad.keyOfParent] as Ids;
            if (!availableIds || !availableIds?.length) {
                console.warn(
                    `Either there are no child models for ${modelRequest.viewModelCtor.name}:${modelRequest.lazyLoad.keyOfParent} yet or they weren't requested`
                );
                this.lazyLoadSubscription(request, subscriptionName, hideWhen);
            } else if (availableIds.length > 20) {
                const childModelRequest = await this.modelRequestBuilder.build({
                    viewModelCtor: modelRequest.lazyLoad.ownViewModelCtor,
                    ids: availableIds.slice(0, 20),
                    fieldset: modelRequest.lazyLoad.fieldset
                });
                const childSubscriptionName = `${subscriptionName}_1`;
                this.lazyLoadSubscription(
                    childModelRequest,
                    childSubscriptionName,
                    timer(3000).pipe(concatMap(() => of(true)))
                );
                setTimeout(async () => {
                    this.lazyLoadSubscription(request, subscriptionName, hideWhen);
                }, Math.floor(Math.random() * 2000) + 2000);
            } else {
                this.lazyLoadSubscription(request, subscriptionName, hideWhen);
            }
        } else {
            this.lazyLoadSubscription(request, subscriptionName, hideWhen);
        }
    }

    private lazyLoadSubscription(
        request: ModelRequestObject,
        subscriptionName: string,
        hideWhen?: Observable<boolean> | null
    ): void {
        const modelSubscription = this.autoupdateService.subscribe(request, `${subscriptionName}:subscription`);
        this._modelSubscriptionMap[subscriptionName] = modelSubscription;
        if (hideWhen) {
            this.setCloseFn(subscriptionName, hideWhen);
        }
    }

    public closeSubscription(subscriptionName: string): void {
        if (this._modelSubscriptionMap[subscriptionName]) {
            this._modelSubscriptionMap[subscriptionName].close();
            delete this._modelSubscriptionMap[subscriptionName];
        }
        if (this._observableSubscriptionMap[subscriptionName]) {
            this._observableSubscriptionMap[subscriptionName].unsubscribe();
            delete this._observableSubscriptionMap[subscriptionName];
        }
    }

    private setCloseFn(requestFamilyName: string, observable: Observable<boolean>): void {
        this._observableSubscriptionMap[requestFamilyName] = observable.subscribe(isTrue => {
            if (isTrue) {
                this.closeSubscription(requestFamilyName);
            }
        });
    }
}
