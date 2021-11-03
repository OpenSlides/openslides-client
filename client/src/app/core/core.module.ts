import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf, Type } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ModelRequestBuilderService } from './core-services/model-request-builder.service';
import { OnAfterAppsLoaded } from './definitions/on-after-apps-loaded';

export const ServicesToLoadOnAppsLoaded: Type<OnAfterAppsLoaded>[] = [ModelRequestBuilderService];

/**
 * Global Core Module.
 */
@NgModule({
    imports: [CommonModule],
    providers: [Title]
})
export class CoreModule {
    /** make sure CoreModule is imported only by one NgModule, the AppModule */
    public constructor(
        @Optional()
        @SkipSelf()
        parentModule: CoreModule
    ) {
        if (parentModule) {
            throw new Error(`CoreModule is already loaded. Import only in AppModule`);
        }
    }
}
