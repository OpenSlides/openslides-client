import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotifyService } from 'src/app/gateways/notify.service';
import { navItemAnim } from 'src/app/infrastructure/animations';
import { getCustomStyleForEntry } from 'src/app/site/base/base-menu-entry';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MainMenuEntry, MainMenuService } from 'src/app/site/pages/meetings/services/main-menu.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { SidenavComponent } from 'src/app/ui/modules/sidenav/components/sidenav/sidenav.component';

import { ChatNotificationService, ChatService } from '../../../../pages/chat';
import { LoadFontService } from '../../../../services/load-font.service';

@Component({
    selector: `os-meetings-navigation-wrapper`,
    templateUrl: `./meetings-navigation-wrapper.component.html`,
    styleUrls: [`./meetings-navigation-wrapper.component.scss`],
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
    public isLoggedIn = false;

    public get mainMenuEntries(): MainMenuEntry[] {
        return this.mainMenuService.entries;
    }

    public get showMeetingNav(): boolean {
        return this.operator.knowsMultipleMeetings || this.operator.hasOrganizationPermissions();
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

    private _loadFontService = inject(LoadFontService); // just to initialize this service
    private _notifyService = inject(NotifyService); // just to initialize this service
    protected override translate = inject(TranslateService);
    private vp = inject(ViewPortService);
    private mainMenuService = inject(MainMenuService);
    private chatNotificationService = inject(ChatNotificationService);
    private chatService = inject(ChatService);
    private operator = inject(OperatorService);

    /**
     * Initialize the site component
     */
    public ngOnInit(): void {
        this.subscriptions.push(...this.getRouterSubscriptions());
        // observe the mainMenuService to receive toggle-requests
        this.mainMenuService.toggleMenuSubject.subscribe(() => this.toggleSideNav());
    }

    public getCustomStyleForEntry(entry: MainMenuEntry): { [key: string]: any } {
        return getCustomStyleForEntry(entry);
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
