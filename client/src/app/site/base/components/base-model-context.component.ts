import { OnDestroy, OnInit, Directive } from '@angular/core';

import { AutoupdateService, ModelSubscription } from 'app/core/core-services/autoupdate.service';
import {
    ModelRequestBuilderService,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from './base.component';

/**
 * Provides functionalities that will be used by most components
 * currently able to set the title with the suffix ' - OpenSlides'
 *
 * A BaseComponent is an OpenSlides Component.
 * Components in the 'Side'- or 'projector' Folder are BaseComponents
 */
@Directive()
export abstract class BaseModelContextComponent extends BaseComponent implements OnInit, OnDestroy {
    protected modelSubscription: ModelSubscription | null = null;

    protected get autoupdateService(): AutoupdateService {
        return this.componentServiceCollector.autoupdateService;
    }

    public constructor(componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        const simplifiedModelRequest = this.getModelRequest();
        if (simplifiedModelRequest) {
            this.requestModels(simplifiedModelRequest);
        }
    }

    protected async requestModels(simplifiedModelRequest: SimplifiedModelRequest): Promise<void> {
        this.closeModelSubscription();
        this.modelSubscription = await this.autoupdateService.simpleRequest(simplifiedModelRequest);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.closeModelSubscription();
    }

    private closeModelSubscription(): void {
        if (this.modelSubscription) {
            this.modelSubscription.close();
            this.modelSubscription = null;
        }
    }

    protected getModelRequest(): SimplifiedModelRequest | null {
        return null;
    }
}
