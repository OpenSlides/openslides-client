import { Directive, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';

import { BaseComponent } from './base.component';

/**
 * Components which call specific model updates
 *
 * Uses ngOnInit to send the model request so make sure it is called if
 * the method is overwritten!
 */
@Directive()
export abstract class BaseModelContextComponent extends BaseComponent implements OnInit, OnDestroy {
    protected localModelSubscriptions: { [name: string]: ModelSubscription };
    private destroyed = false;

    public constructor(
        protected componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
        this.localModelSubscriptions = {};
    }

    public ngOnInit(): void {
        const simplifiedModelRequest = this.getModelRequest();
        if (simplifiedModelRequest) {
            this.requestModels(simplifiedModelRequest);
        }
    }

    /**
     * This subscribes to changes for a specific view-model. Changes will be applied asynchronously.
     *
     * @param simplifiedModelRequest A `SimplifiedModelRequest` which goes to the AU-service
     * @param subscriptionName An optional name for the subscription
     */
    protected async requestModels(
        simplifiedModelRequest: SimplifiedModelRequest,
        subscriptionName: string = `default`
    ): Promise<void> {
        if (this.destroyed) {
            throw new Error(`You have requested models for a component that was destroyed!`);
        }

        this.cleanCurrentModelSub(subscriptionName);
        this.localModelSubscriptions[subscriptionName] = await this.modelRequestService.subscribe(
            simplifiedModelRequest,
            this.constructor.name + ` ` + subscriptionName // Note: This does not work for
            // productive (minified) code, but it is just a dev thing.
        );
    }

    /**
     * This requests immediately changes for a specific view-model. Changes will be applied asynchronously,
     * but it can be wait for.
     *
     * @param modelRequest A `SimplifiedModelRequest` which goes to the AU-service
     * @param description An optional description for the request
     */
    protected async getModelChanges(
        modelRequest: SimplifiedModelRequest,
        description: string = `${this.constructor.name}`
    ): Promise<void> {
        await this.modelRequestService.instant(modelRequest, description);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyed = true;
        for (const name of Object.keys(this.localModelSubscriptions)) {
            this.cleanCurrentModelSub(name);
        }
    }

    private cleanCurrentModelSub(subscriptionName: string): void {
        if (this.localModelSubscriptions[subscriptionName]) {
            this.localModelSubscriptions[subscriptionName].close();
            delete this.localModelSubscriptions[subscriptionName];
        }
    }

    protected hasSubscription(subscriptionName: string): boolean {
        return !!this.localModelSubscriptions[subscriptionName];
    }

    protected getModelRequest(): SimplifiedModelRequest | null {
        return null;
    }
}
