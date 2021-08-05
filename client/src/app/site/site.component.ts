import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { navItemAnim } from '../shared/animations';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { HistoryService } from 'app/core/core-services/history.service';
import { OfflineBroadcastService } from 'app/core/core-services/offline-broadcast.service';
import { TimeTravelService } from 'app/core/core-services/time-travel.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SidenavComponent } from 'app/shared/components/sidenav/sidenav.component';
import { BaseComponent } from 'app/site/base/components/base.component';
import { MainMenuEntry, MainMenuService } from '../core/core-services/main-menu.service';
import { ViewportService } from '../core/ui-services/viewport.service';

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
    @ViewChild('sideNav', { static: true, read: SidenavComponent })
    public sideNav: SidenavComponent;

    /**
     * is the user logged in, or the anonymous is active.
     */
    public isLoggedIn: boolean;

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
        private router: Router,
        public vp: ViewportService,
        public dialog: MatDialog,
        private mainMenuService: MainMenuService,
        public historyService: HistoryService,
        public timeTravel: TimeTravelService,
        public pollRepo: PollRepositoryService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Initialize the site component
     */
    public ngOnInit(): void {
        this.subscriptions.push(...this.getRouterSubscriptions());
        // observe the mainMenuService to receive toggle-requests
        this.mainMenuService.toggleMenuSubject.subscribe(() => this.toggleSideNav());
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

    private getRouterSubscriptions(): Subscription[] {
        return [
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
