import { Component } from '@angular/core';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseMenuEntry, getCustomStyleForEntry } from 'src/app/site/base/base-menu-entry';
import { MainMenuService } from 'src/app/site/pages/meetings/services/main-menu.service';
import { AuthService } from 'src/app/site/services/auth.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';

interface OrgaMenuEntry extends BaseMenuEntry<OML> {}

@Component({
    selector: `os-organization-navigation`,
    templateUrl: `./organization-navigation.component.html`,
    styleUrls: [`./organization-navigation.component.scss`]
})
export class OrganizationNavigationComponent {
    public menuEntries: OrgaMenuEntry[] = [
        {
            route: `/`,
            displayName: `Dashboard`,
            icon: `apps`,
            hasDividerBelow: true,
            weight: 100,
            customHeight: `40px`
        },
        {
            route: `/meetings`,
            displayName: `Meetings`,
            icon: `event_available`,
            weight: 150
        },
        {
            route: `/committees`,
            displayName: `Committees`,
            icon: `layers`,
            weight: 200
        },
        {
            route: `/accounts`,
            displayName: `Accounts`,
            icon: `group`,
            permission: OML.can_manage_users,
            weight: 300
        },
        {
            route: `/organization-tags`,
            displayName: `Tags`,
            icon: `local_offer`,
            permission: OML.can_manage_organization,
            weight: 250
        },
        {
            route: `/mediafiles`,
            displayName: `Files`,
            icon: `attach_file`,
            permission: OML.can_manage_organization,
            weight: 250
        },
        {
            route: `/designs`,
            displayName: `Design`,
            icon: `palette`,
            permission: OML.can_manage_organization,
            weight: 350
        },
        {
            route: `/settings`,
            displayName: `Settings`,
            icon: `settings`,
            permission: OML.can_manage_organization,
            weight: 400
        }
    ];

    public constructor(
        private authService: AuthService,
        private menuService: MainMenuService,
        private vp: ViewPortService
    ) {}

    public getCustomStyleForEntry(entry: OrgaMenuEntry): { [key: string]: any } {
        return getCustomStyleForEntry(entry);
    }

    public logout(): void {
        this.authService.logout();
    }

    public isRouteExact(route: string): boolean {
        return route === `/`;
    }

    public closeSidenavOnMobile(): void {
        if (this.vp.isMobile) {
            this.menuService.toggleMenu();
        }
    }
}
