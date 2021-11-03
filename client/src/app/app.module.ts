import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageModule } from '@ngx-pwa/local-storage';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { AppLoadService } from './core/core-services/app-load.service';
import { httpInterceptorProviders } from './core/core-services/http-interceptors';
import { OpenSlidesTranslateModule } from './core/translate/openslides-translate-module';
import { LoginModule } from './site/login/login.module';
import { SlidesModule } from './slides/slides.module';

/**
 * Returns a function that returns a promis that will be resolved, if all apps are loaded.
 * @param appLoadService The service that loads the apps.
 */
export function AppLoaderFactory(appLoadService: AppLoadService): () => Promise<void> {
    return () => appLoadService.loadApps();
}

/**
 * Global App Module. Keep it as clean as possible.
 */
@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: `OpenSlidesCsrfToken`,
            headerName: `X-CSRFToken`
        }),
        BrowserAnimationsModule,
        OpenSlidesTranslateModule.forRoot(),
        AppRoutingModule,
        CoreModule,
        LoginModule,
        ServiceWorkerModule.register(`ngsw-worker.js`, { enabled: environment.production }),
        SlidesModule.forRoot(),
        StorageModule.forRoot({ IDBNoWrap: false })
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: AppLoaderFactory, deps: [AppLoadService], multi: true },
        httpInterceptorProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
