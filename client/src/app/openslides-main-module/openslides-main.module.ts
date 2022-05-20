import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay/openslides-overlay.module';
import { environment } from 'src/environments/environment';

import { SlidesModule } from '../site/pages/meetings/modules/projector/modules/slides/slides.module';
import { OpenSlidesMainComponent } from './components/openslides-main/openslides-main.component';
import { OpenSlidesOverlayContainerComponent } from './components/openslides-overlay-container/openslides-overlay-container.component';
import { httpInterceptorProviders } from './interceptors';
import { OpenSlidesMainRoutingModule } from './openslides-main-routing.module';
import { AppLoadService } from './services/app-load.service';

/**
 * Returns a function that returns a promis that will be resolved, if all apps are loaded.
 * @param appLoadService The service that loads the apps.
 */
export function AppLoaderFactory(appLoadService: AppLoadService): () => Promise<void> {
    return () => appLoadService.loadApps();
}

const NOT_LAZY_LOADED_MODULES = [MatSnackBarModule, OpenSlidesOverlayModule];

@NgModule({
    declarations: [OpenSlidesMainComponent, OpenSlidesOverlayContainerComponent],
    imports: [
        BrowserModule,
        OpenSlidesMainRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SlidesModule, // TODO: We should remove this!
        OpenSlidesTranslationModule.forRoot(),
        ...NOT_LAZY_LOADED_MODULES,
        ServiceWorkerModule.register(`ngsw-worker.js`, {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: `registerWhenStable:30000`
        })
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: AppLoaderFactory, deps: [AppLoadService], multi: true },
        httpInterceptorProviders
    ],
    bootstrap: [OpenSlidesMainComponent]
})
export class OpenSlidesMainModule {}
