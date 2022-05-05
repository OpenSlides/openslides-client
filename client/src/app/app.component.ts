import { Component, ApplicationRef, OnInit } from '@angular/core';
import { first, tap, firstValueFrom } from 'rxjs';
import { overloadJsFunctions } from './infrastructure/utils/overload-js-functions';
import { Deferred } from './infrastructure/utils/promises';
import { LifecycleService } from './site/services/lifecycle.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { OpenSlidesStatusService } from './site/services/openslides-status.service';
import { OpenSlidesService } from './site/services/openslides.service';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'src/app/ui/modules/openslides-overlay/modules/spinner/services/spinner.service';

@Component({
    selector: 'os-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private onInitDone = new Deferred();

    title = 'OpenSlides';

    public constructor(
        // themeService: ThemeService,
        // _spinnerService: SpinnerService,
        openslidesService: OpenSlidesService,
        private appRef: ApplicationRef,
        private lifecycleService: LifecycleService,
        private domSanitizer: DomSanitizer,
        private openslidesStatus: OpenSlidesStatusService,
        private matIconRegistry: MatIconRegistry,
        private translate: TranslateService
    ) {
        // _spinnerService.show(undefined, { hideWhenStable: true });
        overloadJsFunctions();
        this.waitForAppLoaded();
        this.loadTranslation();
        this.loadCustomIcons();
    }

    private loadTranslation(): void {
        // manually add the supported languages
        this.translate.addLangs([`en`, `de`, `cs`, `ru`]);
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(`en`);
        // get the browsers default language
        const browserLang = this.translate.getBrowserLang() as string;
        // try to use the browser language if it is available. If not, uses english.
        this.translate.use(this.translate.getLangs().includes(browserLang) ? browserLang : `en`);
    }

    private async waitForAppLoaded(): Promise<void> {
        // Wait until the App reaches a stable state.
        // Required for the Service Worker.
        await firstValueFrom(
            this.appRef.isStable.pipe(
                // take only the stable state
                first(stable => stable),
                tap(() => {
                    console.debug(`App is stable now.`);
                    this.openslidesStatus.setStable();
                })
            )
        );
        await this.onInitDone;

        setTimeout(() => {
            this.lifecycleService.appLoaded.next();
        }, 0);
    }

    private loadCustomIcons(): void {
        this.matIconRegistry.addSvgIcon(
            `clapping_hands`,
            this.domSanitizer.bypassSecurityTrustResourceUrl(`../assets/svg/clapping_hands.svg`)
        );
    }

    public ngOnInit(): void {
        this.onInitDone.resolve();
    }
}
