import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { OpenSlidesMainModule } from './app/openslides-main-module/openslides-main.module';
import { OpenSlidesMainRoutingModule } from './app/openslides-main-module/openslides-main-routing.module';
import { OpenSlidesTranslationModule } from './app/site/modules/translations';

/**
 * Share Module for all "dumb" components and pipes.
 *
 * These components don not import and inject services from core or other features
 * in their constructors.
 *
 * Should receive all data though attributes in the template of the component using them.
 * No dependency to the rest of our application.
 */

@NgModule({
    imports: [
        OpenSlidesMainModule,
        CommonModule,
        HttpClientModule,
        OpenSlidesTranslationModule.forRoot(),
        BrowserAnimationsModule,
        OpenSlidesMainRoutingModule
    ],
    exports: [CommonModule, HttpClientModule, OpenSlidesTranslationModule, OpenSlidesMainRoutingModule],
    providers: [{ provide: APP_BASE_HREF, useValue: `/` }]
})
export class E2EImportsModule {}
