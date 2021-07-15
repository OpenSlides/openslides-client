import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { navItemAnim } from '../shared/animations';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { HistoryService } from 'app/core/core-services/history.service';
import { OfflineBroadcastService } from 'app/core/core-services/offline-broadcast.service';
import { TimeTravelService } from 'app/core/core-services/time-travel.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { SuperSearchService } from 'app/core/ui-services/super-search.service';
import { UpdateService } from 'app/core/ui-services/update.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseComponent } from 'app/site/base/components/base.component';
import { MainMenuEntry, MainMenuService } from '../core/core-services/main-menu.service';
import { ViewportService } from '../core/ui-services/viewport.service';

/**
 * Interface to describe possible routing data
 */
interface RoutingData {
    basePerm?: string;
    noInterruption?: boolean;
}

@Component({
    selector: 'os-site',
    animations: [navItemAnim],
    templateUrl: './site.component.html',
    styleUrls: ['./site.component.scss']
})
export class SiteComponent extends BaseComponent implements OnInit {
    /**
     * HTML element of the side panel
     */
    @ViewChild('sideNav', { static: true })
    public sideNav: MatSidenav;

    /**
     * is the user logged in, or the anonymous is active.
     */
    public isLoggedIn: boolean;

    /**
     * Holds the typed search query.
     */
    public searchform: FormGroup;

    /**
     * Hold the current routing data to make certain checks
     */
    private routingData: RoutingData;

    /**
     * Set to true if an update was suppressed
     */
    private delayedUpdateAvailable = false;

    public get mainMenuEntries(): MainMenuEntry[] {
        return this.mainMenuService.entries;
    }

    public get meeting(): ViewMeeting {
        return this.activeMeeting.meeting;
    }

    /**
     * Constructor
     * @param route
     * @param operator
     * @param vp
     * @param translate
     * @param dialog
     * @param mainMenuService
     * @param historyService
     * @param timeTravel
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        _offlineBroadcastService: OfflineBroadcastService,
        private activeMeeting: ActiveMeetingService,
        private updateService: UpdateService,
        private router: Router,
        public vp: ViewportService,
        public dialog: MatDialog,
        private mainMenuService: MainMenuService,
        public historyService: HistoryService,
        public timeTravel: TimeTravelService,
        private searchService: SuperSearchService,
        public pollRepo: PollRepositoryService
    ) {
        super(componentServiceCollector);

        this.searchform = new FormGroup({ query: new FormControl([]) });
    }

    /**
     * Initialize the site component
     */
    public ngOnInit(): void {
        this.subscriptions.push(...this.getRouterSubscriptions());
        // observe the mainMenuService to receive toggle-requests
        this.mainMenuService.toggleMenuSubject.subscribe((value: void) => this.toggleSideNav());

        // get a translation via code: use the translation service
        // this.translate.get('Motions').subscribe((res: string) => {
        //      console.log('translation of motions in the target language: ' + res);
        //  });

        // TODO: Remove this, when the ESR version of Firefox >= 64.
        const agent = navigator.userAgent.toLowerCase();
        if (agent.indexOf('firefox') > -1) {
            const index = agent.indexOf('firefox') + 8;
            const version = +agent.slice(index, index + 2);

            if (version < 64) {
                const sideNav = document.querySelector(
                    'mat-sidenav.side-panel > div.mat-drawer-inner-container'
                ) as HTMLElement;
                sideNav.style.overflow = 'hidden';
                sideNav.addEventListener('MozMousePixelScroll', (event: any) => {
                    sideNav.scrollBy(0, event.detail);
                });
            }
        }

        // check for updates
        this.updateService.updateObservable.subscribe(() => {
            if (this.routingData.noInterruption) {
                this.delayedUpdateAvailable = true;
            } else {
                this.showUpdateNotification();
            }
        });
    }

    /**
     * Shows the update notification
     */
    private showUpdateNotification(): void {
        const ref = this.matSnackBar.open(
            this.translate.instant('A new update is available!'),
            this.translate.instant('Refresh'),
            {
                duration: 0
            }
        );

        // Enforces an update
        ref.onAction().subscribe(() => {
            this.updateService.applyUpdate();
        });
    }

    /**
     * Toggles the side nav
     */
    public toggleSideNav(): void {
        this.sideNav.toggle();
    }

    /**
     * Automatically close the navigation in while navigating in mobile mode
     */
    public mobileAutoCloseNav(): void {
        if (this.vp.isMobile) {
            this.sideNav.close();
        }
    }

    public isRouteExact(route: string): boolean {
        return route === '.' || route === '/';
    }

    /**
     * Function to open the global `super-search.component`.
     *
     * @param event KeyboardEvent to listen to keyboard-inputs.
     */
    @HostListener('document:keydown', ['$event']) public onKeyNavigation(event: KeyboardEvent): void {
        if (event.altKey && event.shiftKey && event.code === 'KeyF') {
            event.preventDefault();
            event.stopPropagation();
            this.searchService.open();
        }
    }

    private getRouterSubscriptions(): Subscription[] {
        return [
            // detect routing data such as base perm and noInterruption
            this.router.events
                .pipe(filter(event => event instanceof ActivationEnd && event.snapshot.children.length === 0))
                .subscribe((event: ActivationEnd) => {
                    this.routingData = event.snapshot.data as RoutingData;

                    // if the current route has no "noInterruption" flag and an update is available, show the update
                    if (this.delayedUpdateAvailable && !this.routingData.noInterruption) {
                        this.showUpdateNotification();
                    }
                }),
            this.router.events.subscribe(event => {
                // Scroll to top if accessing a page, not via browser history stack
                if (event instanceof NavigationEnd) {
                    const contentContainer = document.querySelector('.mat-sidenav-content');
                    if (contentContainer) {
                        contentContainer.scrollTo(0, 0);
                    }
                }
            })
        ];
    }
}
