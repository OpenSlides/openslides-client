import { ApplicationRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DateFnsConfigurationService } from 'ngx-date-fns';
import { first, firstValueFrom, tap } from 'rxjs';
import { availableTranslations } from 'src/app/domain/definitions/languages';
import { HasSequentialNumber } from 'src/app/domain/interfaces';
import { StorageService } from 'src/app/gateways/storage.service';
import { langToTimeLocale } from 'src/app/infrastructure/utils';
import { overloadJsFunctions } from 'src/app/infrastructure/utils/overload-js-functions';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { UpdateService } from 'src/app/site/modules/site-wrapper/services/update.service';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';
import { OpenSlidesService } from 'src/app/site/services/openslides.service';
import { OpenSlidesStatusService } from 'src/app/site/services/openslides-status.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

const CURRENT_LANGUAGE_STORAGE_KEY = `currentLanguage`;

@Component({
    selector: `os-root`,
    templateUrl: `./openslides-main.component.html`,
    styleUrls: [`./openslides-main.component.scss`]
})
export class OpenSlidesMainComponent implements OnInit {
    private onInitDone = new Deferred();

    public title = `OpenSlides`;

    public constructor(
        _viewContainer: ViewContainerRef,
        _openslidesService: OpenSlidesService,
        private appRef: ApplicationRef,
        private lifecycleService: LifecycleService,
        private domSanitizer: DomSanitizer,
        private openslidesStatus: OpenSlidesStatusService,
        private matIconRegistry: MatIconRegistry,
        private translate: TranslateService,
        private storageService: StorageService,
        private config: DateFnsConfigurationService,
        private updateService: UpdateService,
        private router: Router,
        private modelStore: ViewModelStoreService
    ) {
        overloadJsFunctions();
        this.addDebugFunctions();
        this.waitForAppLoaded();
        this.loadTranslation();
        this.loadCustomIcons();
    }

    private loadTranslation(): void {
        // manually add the supported languages
        this.translate.addLangs(Object.keys(availableTranslations));
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(`en`);
        // get the browsers default language
        const browserLang = this.translate.getBrowserLang() as string;

        // get language set in local storage
        this.storageService.get(CURRENT_LANGUAGE_STORAGE_KEY).then(lang => {
            if (lang && this.translate.getLangs().includes(lang as string)) {
                this.translate.use(lang as string);
            } else {
                // try to use the browser language if it is available. If not, uses english.
                this.translate.use(this.translate.getLangs().includes(browserLang) ? browserLang : `en`);
            }

            // set date-fns locale
            this.updateLocaleByName(
                this.translate.currentLang ? this.translate.currentLang : this.translate.defaultLang
            );
        });

        // listen for language changes
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.storageService.set(CURRENT_LANGUAGE_STORAGE_KEY, event.lang);

            // update date-fns locale
            this.updateLocaleByName(event.lang);
        });
    }

    private async updateLocaleByName(name: string): Promise<void> {
        this.config.setLocale(await langToTimeLocale(name));
    }

    private addDebugFunctions(): void {
        const router = this.router;
        const modelStore = this.modelStore;
        Object.defineProperty(Window.prototype, `getID`, {
            value(collection?: string, sequentialNumber?: number): number {
                if (!collection && !sequentialNumber) {
                    const parts = router.url.split(`/`);
                    collection = parts[parts.length - 2];
                    collection = collection.replace(/s$/, ``); // remove plural "s" to get valid collection
                    sequentialNumber = parseInt(parts[parts.length - 1]);
                }
                const model = modelStore.find<BaseViewModel<any> & HasSequentialNumber>(
                    collection,
                    model => model.sequential_number === sequentialNumber
                );
                return model.id;
            },
            enumerable: false
        });
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

        this.router.initialNavigation();
        await this.onInitDone;

        try {
            if (
                (await navigator.serviceWorker?.getRegistrations())?.length &&
                (await Promise.race([
                    this.updateService.checkForUpdate(),
                    new Promise((_, reject) => setTimeout(() => reject(), 3000))
                ]))
            ) {
                await this.updateService.applyUpdate();
                return;
            } else {
                this.updateService.checkForUpdate();
            }
        } catch (_) {
            this.updateService.checkForUpdate();
        }

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
