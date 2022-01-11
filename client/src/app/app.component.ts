import { ApplicationRef, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { first, tap } from 'rxjs/operators';

import { ActiveMeetingService } from './core/core-services/active-meeting.service';
import { ActiveMeetingIdService } from './core/core-services/active-meeting-id.service';
import { DataStoreUpgradeService } from './core/core-services/data-store-upgrade.service';
import { LifecycleService } from './core/core-services/lifecycle.service';
import { OfflineService } from './core/core-services/offline.service';
import { OpenSlidesService } from './core/core-services/openslides.service';
import { OpenSlidesStatusService } from './core/core-services/openslides-status.service';
import { OperatorService } from './core/core-services/operator.service';
import { ServertimeService } from './core/core-services/servertime.service';
import { Deferred } from './core/promises/deferred';
import { CountUsersService } from './core/ui-services/count-users.service';
import { LoadFontService } from './core/ui-services/load-font.service';
import { RoutingStateService } from './core/ui-services/routing-state.service';
import { SpinnerService } from './core/ui-services/spinner.service';
import { ThemeService } from './core/ui-services/theme.service';
import { VotingBannerService } from './core/ui-services/voting-banner.service';
import { overloadJsFunctions } from './shared/overload-js-functions';

/**
 * Angular's global App Component
 */
@Component({
    selector: `os-root`,
    templateUrl: `./app.component.html`,
    styleUrls: [`./app.component.scss`]
})
export class AppComponent implements OnInit {
    private onInitDone = new Deferred();

    /**
     * Main-component of all apps.
     *
     * Inits the translation service, the operator, the login data and the constants.
     *
     * Handles the altering of Array.toString()
     */
    public constructor(
        translate: TranslateService,
        private appRef: ApplicationRef,
        openslidesService: OpenSlidesService,
        activeMeetingIdService: ActiveMeetingIdService,
        activeMeetingService: ActiveMeetingService,
        private lifecycleService: LifecycleService,
        router: Router,
        offlineService: OfflineService,
        servertimeService: ServertimeService,
        operator: OperatorService,
        themeService: ThemeService,
        spinnerService: SpinnerService,
        countUsersService: CountUsersService, // Needed to register itself.
        loadFontService: LoadFontService,
        dataStoreUpgradeService: DataStoreUpgradeService, // to start it.
        routingState: RoutingStateService,
        votingBannerService: VotingBannerService, // needed for initialisation
        offlineSerice: OfflineService,
        private openslidesStatus: OpenSlidesStatusService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        spinnerService.show(null, { hideWhenStable: true });
        // manually add the supported languages
        translate.addLangs([`en`, `de`, `cs`, `ru`]);
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(`en`);
        // get the browsers default language
        const browserLang = translate.getBrowserLang();
        // try to use the browser language if it is available. If not, uses english.
        translate.use(translate.getLangs().includes(browserLang) ? browserLang : `en`);

        // change default JS functions
        overloadJsFunctions();

        this.loadCustomIcons();

        this.waitForAppLoaded();
    }

    private async waitForAppLoaded(): Promise<void> {
        // Wait until the App reaches a stable state.
        // Required for the Service Worker.
        await this.appRef.isStable
            .pipe(
                // take only the stable state
                first(stable => stable),
                tap(() => {
                    console.debug(`App is stable now.`);
                    this.openslidesStatus.setStable();
                })
            )
            .toPromise();
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
