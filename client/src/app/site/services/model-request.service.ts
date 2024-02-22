import { Injectable } from '@angular/core';
import { concatMap, Observable, of, Subscription, timer } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { isValidId } from 'src/app/infrastructure/utils';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';

import { AutoupdateService, ModelSubscription } from './autoupdate';
import { ModelData } from './autoupdate/utils';
import { SimplifiedModelRequest } from './model-request-builder';

export interface SubscribeToConfig {
    modelRequest: SimplifiedModelRequest;
    subscriptionName: string;
    hideWhen?: Observable<boolean> | null;
    isDelayed?: boolean;
}

export const SUBSCRIPTION_SUFFIX = `:subscription`;

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
    public async updateSubscribeTo(...configs: SubscribeToConfig[]): Promise<void> {
        const subscribeToCalls = [];
        for (const config of configs) {
            const { subscriptionName } = config;
            this.closeSubscription(subscriptionName);
            subscribeToCalls.push(this.subscribeTo(config));
        }

        await Promise.all(subscribeToCalls);
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
                await this.makeSubscription({ modelRequest, subscriptionName, ...config });
            } else if (availableIds.length > 20) {
                this.lazyLoadSubscription({ modelRequest, subscriptionName, ...config }, availableIds);
            } else {
                await this.makeSubscription({ modelRequest, subscriptionName, ...config });
            }
        } else {
            await this.makeSubscription({ modelRequest, subscriptionName, ...config });
        }
    }

    public async subscriptionGotData(subscriptionName: string): Promise<boolean | ModelData> {
        if (!this._modelSubscriptionMap[subscriptionName]) {
            return false;
        }

        return await this._modelSubscriptionMap[subscriptionName].receivedData;
    }

    public async fetch({ modelRequest, subscriptionName }: SubscribeToConfig): Promise<ModelData> {
        const request = await this.modelRequestBuilder.build(modelRequest);
        return await this.autoupdateService.single(request, `${subscriptionName}:single`);
    }

    private async makeSubscription({
        modelRequest,
        subscriptionName,
        hideWhen,
        isDelayed = true
    }: SubscribeToConfig): Promise<void> {
        const ids = modelRequest.ids;
        const invalidIds = ids.filter(id => !isValidId(id));
        if (invalidIds.length === ids.length) {
            console.warn(`${subscriptionName}: No valid ids in configuration: Skipped subscription.`);
            return;
        } else if (invalidIds.length) {
            console.warn(`${subscriptionName}: Skipped invalid ids in configuration.`);
            modelRequest.ids = ids.filter(id => isValidId(id));
        }
        const fn = async () => {
            const request = await this.modelRequestBuilder.build(modelRequest);
            const modelSubscription = await this.autoupdateService.subscribe(
                request,
                `${subscriptionName}${SUBSCRIPTION_SUFFIX}`
            );
            this._modelSubscriptionMap[subscriptionName] = modelSubscription;
            if (hideWhen) {
                this.setCloseFn(subscriptionName, hideWhen);
            }
        };
        if (isDelayed) {
            // const delay = Math.floor(Math.random() * 390 + 110); // [110, 500]
            await new Promise(r => setTimeout(r, 0));
        }
        await fn();
    }

    public async waitSubscriptionReady(subscriptionName: string, waitExistingDuration = 4000): Promise<void> {
        if (this._modelSubscriptionMap[subscriptionName]) {
            await this._modelSubscriptionMap[subscriptionName].receivedData;
        } else {
            const retryInterval = 100;
            for (let i = 0; i <= waitExistingDuration; i += retryInterval) {
                await new Promise(resolve => setTimeout(resolve, retryInterval));

                if (this._modelSubscriptionMap[subscriptionName]) {
                    await this._modelSubscriptionMap[subscriptionName].receivedData;
                    return;
                }
            }

            throw new Error(`Subscription not found`);
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

    private setCloseFn(requestFamilyName: string, observable: Observable<boolean>): void {
        this._observableSubscriptionMap[requestFamilyName] = observable.subscribe(isTrue => {
            if (isTrue) {
                this.closeSubscription(requestFamilyName);
            }
        });
    }
}
