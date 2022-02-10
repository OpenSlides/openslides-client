import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { HistoryService } from 'app/core/core-services/history.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { TimeTravelService } from 'app/core/core-services/time-travel.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SidenavComponent } from 'app/shared/components/sidenav/sidenav.component';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Observable, Subscription } from 'rxjs';

import { MainMenuEntry, MainMenuService } from '../core/core-services/main-menu.service';
import { ViewportService } from '../core/ui-services/viewport.service';
import { navItemAnim } from '../shared/animations';
import { ChatService } from './chat/services/chat.service';
import { ChatNotificationService } from './chat/services/chat-notification.service';

@Component({
    selector: `os-site`,
    animations: [navItemAnim],
    templateUrl: `./site.component.html`,
    styleUrls: [`./site.component.scss`]
})
export class SiteComponent extends BaseComponent implements OnInit {
    /**
     * HTML element of the side panel
     */
    @ViewChild(`sideNav`, { static: true, read: SidenavComponent })
    public sideNav: SidenavComponent;

    /**
     * is the user logged in, or the anonymous is active.
     */
    public isLoggedIn: boolean;

    public get mainMenuEntries(): MainMenuEntry[] {
        return this.mainMenuService.entries;
    }

    public get showMeetingNav(): boolean {
        return this.operator.knowsMultipleMeetings;
    }

    public get meeting(): ViewMeeting {
        return this.activeMeeting;
    }

    public get canSeeChatObservable(): Observable<boolean> {
        return this.chatService.canSeeChatObservable;
    }

    public get chatNotificationsObservable(): Observable<number> {
        return this.chatNotificationService.allChatGroupsNotificationsObservable;
    }

    /**
     * Constructor
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private router: Router,
        public vp: ViewportService,
        public dialog: MatDialog,
        private mainMenuService: MainMenuService,
        public historyService: HistoryService,
        public timeTravel: TimeTravelService,
        public pollRepo: PollRepositoryService,
        private chatNotificationService: ChatNotificationService,
        private chatService: ChatService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
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
        return route === `.` || route === `/`;
    }

    private getRouterSubscriptions(): Subscription[] {
        return [
            this.router.events.subscribe(event => {
                // Scroll to top if accessing a page, not via browser history stack
                if (event instanceof NavigationEnd) {
                    const contentContainer = document.querySelector(`.mat-sidenav-content`);
                    if (contentContainer) {
                        contentContainer.scrollTo(0, 0);
                    }
                }
            })
        ];
    }
}
