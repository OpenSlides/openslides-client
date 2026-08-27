import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { OpenSlidesMainComponent } from '@app/openslides-main-module/components/openslides-main/openslides-main.component';

import { OpenSlidesTranslationModule } from './app/site/modules/translations/openslides-translation.module';

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
    exports: [CommonModule, OpenSlidesTranslationModule],
    imports: [OpenSlidesMainComponent, CommonModule, OpenSlidesTranslationModule],
    providers: [{ provide: APP_BASE_HREF, useValue: `/` }, provideHttpClient(withXhr(), withInterceptorsFromDi())]
})
export class E2EImportsModule {}
