import { ApplicationRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { first, firstValueFrom, tap } from 'rxjs';
import { overloadJsFunctions } from 'src/app/infrastructure/utils/overload-js-functions';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';
import { OpenSlidesService } from 'src/app/site/services/openslides.service';
import { OpenSlidesStatusService } from 'src/app/site/services/openslides-status.service';

@Component({
    selector: `os-root`,
    templateUrl: `./openslides-main.component.html`,
    styleUrls: [`./openslides-main.component.scss`]
})
export class OpenSlidesMainComponent implements OnInit {
    private onInitDone = new Deferred();

    title = `OpenSlides`;

    public constructor(
        _viewContainer: ViewContainerRef,
        _openslidesService: OpenSlidesService,
        private appRef: ApplicationRef,
        private lifecycleService: LifecycleService,
        private domSanitizer: DomSanitizer,
        private openslidesStatus: OpenSlidesStatusService,
        private matIconRegistry: MatIconRegistry,
        private translate: TranslateService
    ) {
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
