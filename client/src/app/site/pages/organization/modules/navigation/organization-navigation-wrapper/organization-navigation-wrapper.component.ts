import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { MainMenuEntry, MainMenuService } from 'src/app/site/pages/meetings/services/main-menu.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { SidenavComponent } from 'src/app/ui/modules/sidenav/components/sidenav/sidenav.component';

@Component({
    selector: `os-organization-navigation-wrapper`,
    templateUrl: `./organization-navigation-wrapper.component.html`,
    styleUrls: [`./organization-navigation-wrapper.component.scss`]
})
export class OrganizationNavigationWrapperComponent extends BaseComponent implements OnInit {
    /**
     * HTML element of the side panel
     */
    @ViewChild(`sideNav`, { static: true, read: SidenavComponent })
    public sideNav: SidenavComponent | null = null;

    public get mainMenuEntries(): MainMenuEntry[] {
        return this.mainMenuService.entries;
    }

    /**
     * Constructor
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private vp: ViewPortService,
        private mainMenuService: MainMenuService
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
