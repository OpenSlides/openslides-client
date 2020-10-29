import { Directive, OnDestroy, OnInit } from '@angular/core';

import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { ModelRequestService } from 'app/core/core-services/model-request.service';
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
    protected localModelSub: ModelSubscription | null = null;

    public constructor(protected componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        const simplifiedModelRequest = this.getModelRequest();
        if (simplifiedModelRequest) {
            this.requestModels(simplifiedModelRequest);
        }
    }

    protected async requestModels(simplifiedModelRequest: SimplifiedModelRequest): Promise<void> {
        this.cleanCurrentModelSub();
        console.log('requesting...', simplifiedModelRequest);
        this.localModelSub = await this.componentServiceCollector.modelRequestService.requestModels(
            simplifiedModelRequest
        );
        console.log('Done!', simplifiedModelRequest);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cleanCurrentModelSub();
    }

    private cleanCurrentModelSub(): void {
        if (this.localModelSub) {
            this.localModelSub.close();
            this.localModelSub = null;
        }
    }

    protected getModelRequest(): SimplifiedModelRequest | null {
        return null;
    }
}
