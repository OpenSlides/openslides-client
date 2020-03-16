import { OnDestroy, OnInit } from '@angular/core';

import { AutoupdateService, ModelRequest, ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from './base.component';

/**
 * Provides functionalities that will be used by most components
 * currently able to set the title with the suffix ' - OpenSlides'
 *
 * A BaseComponent is an OpenSlides Component.
 * Components in the 'Side'- or 'projector' Folder are BaseComponents
 */
export abstract class BaseModelContextComponent extends BaseComponent implements OnInit, OnDestroy {
    private modelSubscription: ModelSubscription | null = null;

    protected get autoupdateService(): AutoupdateService {
        return this.componentServiceCollector.autoupdateService;
    }

    public constructor(componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        const modelRequest = this.getModelRequest();
        if (modelRequest) {
            this.modelSubscription = this.autoupdateService.request(modelRequest);
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.modelSubscription) {
            this.modelSubscription.close();
        }
    }

    protected getModelRequest(): ModelRequest | null {
        return null;
    }
}
