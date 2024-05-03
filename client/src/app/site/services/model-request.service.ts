import { Injectable } from '@angular/core';
import { filter, Observable, Subscription } from 'rxjs';
import { isValidId } from 'src/app/infrastructure/utils';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';

import { AutoupdateService, ModelSubscription } from './autoupdate';
import { ModelData } from './autoupdate/utils';
import { SimplifiedModelRequest } from './model-request-builder';

export interface SubscribeToConfig {
    modelRequest: SimplifiedModelRequest;
    subscriptionName: string;
    hideWhen?: Observable<boolean> | null;
    unusedWhen?: Observable<boolean> | null;
}

interface ModelSubscriptionMapEntry {
    modelSubscription: ModelSubscription;
    hideSubscription?: Subscription;
    unusedSubscription?: Subscription;
}

export const SUBSCRIPTION_SUFFIX = `:subscription`;

@Injectable({
    providedIn: `root`
})
export class ModelRequestService {
    private _modelSubscriptionMap: Map<string, ModelSubscriptionMapEntry> = new Map();

    public constructor(
        private autoupdateService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService
    ) {}

    public async subscribeTo({ modelRequest, subscriptionName, ...config }: SubscribeToConfig): Promise<void> {
        if (this._modelSubscriptionMap.has(subscriptionName)) {
            // TODO: Check and update unused subscription
            console.warn(`A subscription already made for ${subscriptionName}. Aborting.`);
            return;
        }
        modelRequest.fieldset = modelRequest.fieldset || [];
        await this.makeSubscription({ modelRequest, subscriptionName, ...config });
    }

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

    public async fetch({ modelRequest, subscriptionName }: SubscribeToConfig): Promise<ModelData> {
        const request = await this.modelRequestBuilder.build(modelRequest);
        return await this.autoupdateService.single(request, `${subscriptionName}:single`);
    }

    public async subscriptionGotData(subscriptionName: string): Promise<boolean | ModelData> {
        if (!this._modelSubscriptionMap.has(subscriptionName)) {
            return false;
        }

        return await this._modelSubscriptionMap.get(subscriptionName).modelSubscription.receivedData;
    }

    public async waitSubscriptionReady(
        subscriptionName: string,
        waitExistingDuration = 4000
    ): Promise<boolean | ModelData> {
        if (this._modelSubscriptionMap.has(subscriptionName)) {
            return await this._modelSubscriptionMap.get(subscriptionName).modelSubscription.receivedData;
        }

        const retryInterval = 100;
        for (let i = 0; i <= waitExistingDuration; i += retryInterval) {
            await new Promise(resolve => setTimeout(resolve, retryInterval));

            if (this._modelSubscriptionMap.has(subscriptionName)) {
                return await this._modelSubscriptionMap.get(subscriptionName).modelSubscription.receivedData;
            }
        }

        throw new Error(`Subscription not found`);
    }

    public closeSubscription(subscriptionName: string): void {
        if (this._modelSubscriptionMap.has(subscriptionName)) {
            const entry = this._modelSubscriptionMap.get(subscriptionName);
            this._modelSubscriptionMap.delete(subscriptionName);
            entry.modelSubscription.close();
            if (entry.hideSubscription) {
                entry.hideSubscription.unsubscribe();
            }

            if (entry.unusedSubscription) {
                entry.unusedSubscription.unsubscribe();
            }
        }
    }

    private async makeSubscription({ modelRequest, subscriptionName, hideWhen }: SubscribeToConfig): Promise<void> {
        const ids = modelRequest.ids;
        const invalidIds = ids.filter(id => !isValidId(id));
        if (invalidIds.length === ids.length) {
            console.warn(`${subscriptionName}: No valid ids in configuration: Skipped subscription.`);
            return;
        } else if (invalidIds.length) {
            console.warn(`${subscriptionName}: Skipped invalid ids in configuration.`);
            modelRequest.ids = ids.filter(id => isValidId(id));
        }

        const request = await this.modelRequestBuilder.build(modelRequest);
        const modelSubscription = await this.autoupdateService.subscribe(
            request,
            `${subscriptionName}${SUBSCRIPTION_SUFFIX}`
        );
        this._modelSubscriptionMap.set(subscriptionName, {
            modelSubscription,
            hideSubscription: hideWhen?.pipe(filter(v => v)).subscribe(() => this.closeSubscription(subscriptionName))
        });
    }
}
