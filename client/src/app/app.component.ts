import { AfterViewInit, ApplicationRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { filter, take } from 'rxjs/operators';

import { ActiveMeetingIdService } from './core/core-services/active-meeting-id.service';
import { ActiveMeetingService } from './core/core-services/active-meeting.service';
import { CountUsersService } from './core/ui-services/count-users.service';
import { DataStoreUpgradeService } from './core/core-services/data-store-upgrade.service';
import { Deferred } from './core/promises/deferred';
import { LifecycleService } from './core/core-services/lifecycle.service';
import { LoadFontService } from './core/ui-services/load-font.service';
import { LoginDataService } from './core/ui-services/login-data.service';
import { OfflineService } from './core/core-services/offline.service';
import { OpenSlidesService } from './core/core-services/openslides.service';
import { OperatorService } from './core/core-services/operator.service';
import { OverlayService } from './core/ui-services/overlay.service';
import { overloadJsFunctions } from './shared/overload-js-functions';
import { RoutingStateService } from './core/ui-services/routing-state.service';
import { ServertimeService } from './core/core-services/servertime.service';
import { ThemeService } from './core/ui-services/theme.service';
import { VotingBannerService } from './core/ui-services/voting-banner.service';

/**
 * Angular's global App Component
 */
@Component({
    selector: 'os-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private onInitDone = new Deferred();

    /**
     * Master-component of all apps.
     *
     * Inits the translation service, the operator, the login data and the constants.
     *
     * Handles the altering of Array.toString()
     */
    public constructor(
        translate: TranslateService,
        private appRef: ApplicationRef,
        private openslidesService: OpenSlidesService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private activeMeetingService: ActiveMeetingService,
        private lifecycleService: LifecycleService,
        router: Router,
        offlineService: OfflineService,
        servertimeService: ServertimeService,
        operator: OperatorService,
        loginDataService: LoginDataService,
        themeService: ThemeService,
        overlayService: OverlayService,
        countUsersService: CountUsersService, // Needed to register itself.
        loadFontService: LoadFontService,
        dataStoreUpgradeService: DataStoreUpgradeService, // to start it.
        routingState: RoutingStateService,
        votingBannerService: VotingBannerService, // needed for initialisation
        offlineSerice: OfflineService
    ) {
        // manually add the supported languages
        translate.addLangs(['en', 'de', 'cs', 'ru']);
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        // get the browsers default language
        const browserLang = translate.getBrowserLang();
        // try to use the browser language if it is available. If not, uses english.
        translate.use(translate.getLangs().includes(browserLang) ? browserLang : 'en');

        // change default JS functions
        overloadJsFunctions();

        this.waitForAppLoaded();
    }

    private async waitForAppLoaded(): Promise<void> {
        // Wait until the App reaches a stable state.
        // Required for the Service Worker.
        await this.appRef.isStable
            .pipe(
                // take only the stable state
                filter(s => s),
                take(1)
            )
            .toPromise();
        await this.onInitDone;

        setTimeout(() => {
            this.lifecycleService.appLoaded.next();
        }, 0);
    }

    public ngOnInit(): void {
        this.onInitDone.resolve();
    }
}
