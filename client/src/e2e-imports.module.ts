import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {OpenSlidesMainRoutingModule} from './app/openslides-main-module/openslides-main-routing.module';
import {OpenSlidesMainModule} from './app/openslides-main-module/openslides-main.module';

// import { AppRoutingModule } from './app/app-routing.module';
// import { SharedModule } from './app/shared/shared.module';
// import { LoginModule } from './app/site/login/login.module';
import {OpenSlidesTranslationModule} from './app/site/modules/translations';
import {SiteModule} from './app/site/site.module';

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
        // AppModule,
        CommonModule,
        // SharedModule,
        HttpClientModule,
        OpenSlidesTranslationModule.forRoot(),
        // LoginModule,
        BrowserAnimationsModule,
        OpenSlidesMainRoutingModule
        // AppRoutingModule
    ],
    exports: [
        CommonModule,
        // SharedModule,
        HttpClientModule,
        OpenSlidesTranslationModule,
        OpenSlidesMainRoutingModule
        // AppRoutingModule
    ],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
})
export class E2EImportsModule {}
