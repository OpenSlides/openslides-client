import { Component, OnInit, ViewChild } from '@angular/core';
import { SidenavComponent } from 'src/app/ui/modules/sidenav/components/sidenav/sidenav.component';
import { MainMenuEntry, MainMenuService } from 'src/app/site/pages/meetings/services/main-menu.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { Observable, Subscription } from 'rxjs';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { navItemAnim } from 'src/app/infrastructure/animations';
import { ChatNotificationService, ChatService } from '../../../../pages/chat';
import { LoadFontService } from '../../../../services/load-font.service';

@Component({
    selector: 'os-meetings-navigation-wrapper',
    templateUrl: './meetings-navigation-wrapper.component.html',
    styleUrls: ['./meetings-navigation-wrapper.component.scss'],
    animations: [navItemAnim]
})
export class MeetingsNavigationWrapperComponent extends BaseMeetingComponent implements OnInit {
    /**
     * HTML element of the side panel
     */
    @ViewChild(`sideNav`, { static: true, read: SidenavComponent })
    public sideNav: SidenavComponent | null = null;

    /**
     * is the user logged in, or the anonymous is active.
     */
    public isLoggedIn: boolean = false;

    public get mainMenuEntries(): MainMenuEntry[] {
        return this.mainMenuService.entries;
    }

    public get showMeetingNav(): boolean {
        return this.operator.knowsMultipleMeetings;
    }

    public get meeting(): ViewMeeting | null {
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
        componentServiceCollector: MeetingComponentServiceCollectorService,
        translate: TranslateService,
        _loadFontService: LoadFontService, // just to initialize this service
        private vp: ViewPortService,
        private mainMenuService: MainMenuService,
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
        this.sideNav?.toggle();
    }

    /**
     * Automatically close the navigation in while navigating in mobile mode
     */
    public mobileAutoCloseNav(): void {
        if (this.vp.isMobile) {
            this.sideNav?.close();
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
