import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
    ApplicationConfig,
    enableProdMode,
    inject,
    isDevMode,
    provideAppInitializer,
    provideZoneChangeDetection
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withDisabledInitialNavigation, withPreloading } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { OpenSlidesMainComponent } from '@app/openslides-main-module/components/openslides-main/openslides-main.component';
import { httpInterceptorProviders } from '@app/openslides-main-module/interceptors';
import { AppLoadService } from '@app/openslides-main-module/services/app-load.service';
import { CustomTranslationService } from '@app/site/modules/translations/custom-translation.service';
import { CustomMissingTranslationHandler } from '@app/site/modules/translations/missing-translation-handler';
import { CustomTranslationParser } from '@app/site/modules/translations/translation-parser';
import { PruningTranslationLoader } from '@app/site/modules/translations/translation-pruning-loader';
import { WaitForActionDialogService } from '@app/site/modules/wait-for-action-dialog/services';
import {
    provideMissingTranslationHandler,
    provideTranslateService,
    TranslateLoader,
    TranslateParser
} from '@ngx-translate/core';

import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

/**
 * Returns a function that returns a promis that will be resolved, if all apps are loaded.
 * @param appLoadService The service that loads the apps.
 */
export function AppLoaderFactory(appLoadService: AppLoadService): () => Promise<void> {
    return () => appLoadService.loadApps();
}

// Firefox does not close connections to the autoupdate service
// when a ServiceWorker is active https://bugzilla.mozilla.org/show_bug.cgi?id=1984032
const isFirefox = navigator.userAgent.search('Firefox') > -1;
if (isFirefox && `serviceWorker` in navigator) {
    navigator.serviceWorker.ready.then(r => r.unregister());
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            [
                {
                    path: ``,
                    loadChildren: () => import(`./app/site/site.module`).then(m => m.SiteModule)
                }
            ],
            withDisabledInitialNavigation(),
            withPreloading(PreloadAllModules)
        ),
        provideZoneChangeDetection(),
        WaitForActionDialogService,
        httpInterceptorProviders,
        provideAppInitializer(() => {
            const initializerFn = AppLoaderFactory(inject(AppLoadService));
            return initializerFn();
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideTranslateService({
            fallbackLang: `en`,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [HttpClient]
            },
            missingTranslationHandler: provideMissingTranslationHandler(CustomMissingTranslationHandler),
            parser: {
                provide: TranslateParser,
                useClass: CustomTranslationParser,
                deps: [CustomTranslationService]
            }
        }),
        provideServiceWorker('sw.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ]
};

bootstrapApplication(OpenSlidesMainComponent, appConfig).catch(err => console.error(err));
