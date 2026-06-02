import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { OpenSlidesMainModule } from './app/openslides-main-module/openslides-main.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(OpenSlidesMainModule, { applicationProviders: [provideZoneChangeDetection()] })
    .catch(err => console.error(err));
