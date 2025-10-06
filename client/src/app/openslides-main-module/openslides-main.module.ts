import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideTranslateService, TranslateLoader, TranslateParser } from '@ngx-translate/core';
import { GlobalSpinnerModule } from 'src/app/site/modules/global-spinner';
import { environment } from 'src/environments/environment';

import { CustomTranslationService } from '../site/modules/translations/custom-translation.service';
import { CustomTranslationParser } from '../site/modules/translations/translation-parser';
import { PruningTranslationLoader } from '../site/modules/translations/translation-pruning-loader';
import { WaitForActionDialogModule } from '../site/modules/wait-for-action-dialog';
import { WaitForActionDialogService } from '../site/modules/wait-for-action-dialog/services';
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

const NOT_LAZY_LOADED_MODULES = [MatSnackBarModule, GlobalSpinnerModule, WaitForActionDialogModule];

// Firefox does not close connections to the autoupdate service
// when a ServiceWorker is active https://bugzilla.mozilla.org/show_bug.cgi?id=1984032
const isFirefox = navigator.userAgent.search('Firefox') > -1;
if (isFirefox && `serviceWorker` in navigator) {
    navigator.serviceWorker.ready.then(r => r.unregister());
}

@NgModule({
    declarations: [OpenSlidesMainComponent, OpenSlidesOverlayContainerComponent],
    bootstrap: [OpenSlidesMainComponent],
    imports: [
        BrowserModule,
        OpenSlidesMainRoutingModule,
        BrowserAnimationsModule,
        ...NOT_LAZY_LOADED_MODULES,
        ServiceWorkerModule.register(`sw.js`, {
            enabled: environment.production && !isFirefox,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: `registerWhenStable:30000`
        })
    ],
    providers: [
        WaitForActionDialogService,
        provideAppInitializer(() => {
            const initializerFn = AppLoaderFactory(inject(AppLoadService));
            return initializerFn();
        }),
        httpInterceptorProviders,
        provideHttpClient(withInterceptorsFromDi()),
        provideTranslateService({
            defaultLanguage: `en`,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [HttpClient]
            },
            parser: {
                provide: TranslateParser,
                useClass: CustomTranslationParser,
                deps: [CustomTranslationService]
            }
        })
    ]
})
export class OpenSlidesMainModule {}
