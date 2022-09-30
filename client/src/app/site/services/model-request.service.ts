import { Injectable } from '@angular/core';
import { concatMap, Observable, of, Subscription, timer } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';

import { AutoupdateService, ModelSubscription } from './autoupdate';
import { SimplifiedModelRequest } from './model-request-builder';

export interface SubscribeToConfig {
    modelRequest: SimplifiedModelRequest;
    subscriptionName: string;
    hideWhen?: Observable<boolean> | null;
    isDelayed?: boolean;
}

@Injectable({
    providedIn: `root`
})
export class ModelRequestService {
    private _modelSubscriptionMap: { [requestFamilyName: string]: ModelSubscription } = {};
    private _observableSubscriptionMap: { [requestFamilyName: string]: Subscription } = {};

    public constructor(
        private autoupdateService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private DS: DataStoreService
    ) {}

    /**
     * Pass several subscription configs which will be fired asynchronously.
     * Pay attention: They will not be awaited!
     */
    public updateSubscribeTo(...configs: SubscribeToConfig[]): void {
        for (const config of configs) {
            const { subscriptionName } = config;
            this.closeSubscription(subscriptionName);
            this.subscribeTo(config);
        }
    }

    public async subscribeTo({ modelRequest, subscriptionName, ...config }: SubscribeToConfig): Promise<void> {
        if (this._modelSubscriptionMap[subscriptionName]) {
            console.warn(`A subscription already made for ${subscriptionName}. Aborting.`);
            return;
        }
        modelRequest.fieldset = modelRequest.fieldset || [];
        if (modelRequest.lazyLoad) {
            const parentModel = this.DS.get(modelRequest.viewModelCtor, modelRequest.lazyLoad.specificId);
            const availableIds = parentModel[modelRequest.lazyLoad.keyOfParent] as Ids;
            if (!availableIds || !availableIds?.length) {
                console.warn(
                    `Either there are no child models for ${modelRequest.viewModelCtor.name}:${modelRequest.lazyLoad.keyOfParent} yet or they weren't requested`
                );
                this.makeSubscription({ modelRequest, subscriptionName, ...config });
            } else if (availableIds.length > 20) {
                this.lazyLoadSubscription({ modelRequest, subscriptionName, ...config }, availableIds);
            } else {
                this.makeSubscription({ modelRequest, subscriptionName, ...config });
            }
        } else {
            this.makeSubscription({ modelRequest, subscriptionName, ...config });
        }
    }

    private async makeSubscription({
        modelRequest,
        subscriptionName,
        hideWhen,
        isDelayed = true
    }: SubscribeToConfig): Promise<void> {
        const fn = async () => {
            const request = await this.modelRequestBuilder.build(modelRequest);
            const modelSubscription = await this.autoupdateService.subscribe(
                request,
                `${subscriptionName}:subscription`
            );
            this._modelSubscriptionMap[subscriptionName] = modelSubscription;
            if (hideWhen) {
                this.setCloseFn(subscriptionName, hideWhen);
            }
        };
        if (isDelayed) {
            // const delay = Math.floor(Math.random() * 390 + 110); // [110, 500]
            setTimeout(() => fn(), 0);
        } else {
            fn();
        }
    }

    private async lazyLoadSubscription(
        { modelRequest, subscriptionName, ...config }: SubscribeToConfig,
        availableIds: Ids
    ): Promise<void> {
        const childModelRequest = {
            viewModelCtor: modelRequest.lazyLoad.ownViewModelCtor,
            ids: availableIds.slice(0, 20),
            fieldset: modelRequest.lazyLoad.fieldset
        };
        const childSubscriptionName = `${subscriptionName}_1`;
        this.makeSubscription({
            modelRequest: childModelRequest,
            subscriptionName: childSubscriptionName,
            hideWhen: timer(3000).pipe(concatMap(() => of(true)))
        });
        setTimeout(async () => {
            this.makeSubscription({ modelRequest, subscriptionName, ...config });
        }, Math.floor(Math.random() * 2000) + 2000);
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
