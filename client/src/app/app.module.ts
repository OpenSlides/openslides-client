import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OpenSlidesTranslationModule } from './site/modules/translations';
import { HttpClientModule } from '@angular/common/http';
import { AppLoadService } from './openslides-main-module/services/app-load.service';
import { httpInterceptorProviders } from './site/interceptors';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay/openslides-overlay.module';
import { SlidesModule } from './site/pages/meetings/modules/projector/modules/slides/slides.module';

/**
 * Returns a function that returns a promis that will be resolved, if all apps are loaded.
 * @param appLoadService The service that loads the apps.
 */
export function AppLoaderFactory(appLoadService: AppLoadService): () => Promise<void> {
    return () => appLoadService.loadApps();
}

const NOT_LAZY_LOADED_MODULES = [MatSnackBarModule, OpenSlidesOverlayModule];

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SlidesModule, // TODO: We should remove this!
        OpenSlidesTranslationModule.forRoot(),
        ...NOT_LAZY_LOADED_MODULES
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: AppLoaderFactory, deps: [AppLoadService], multi: true },
        httpInterceptorProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
