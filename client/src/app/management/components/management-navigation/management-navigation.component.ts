import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { AuthService } from 'app/core/core-services/auth.service';
import { MainMenuService } from 'app/core/core-services/main-menu.service';
import { OML } from 'app/core/core-services/organization-permission';
import { BaseMenuEntry } from 'app/core/definitions/base-menu-entry';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';

interface OrgaMenuEntry extends BaseMenuEntry<OML> {}

@Component({
    selector: 'os-management-navigation',
    templateUrl: './management-navigation.component.html',
    styleUrls: ['./management-navigation.component.scss']
})
export class ManagementNavigationComponent {
    public menuEntries: OrgaMenuEntry[] = [
        {
            route: '/',
            displayName: 'Calendar',
            icon: 'event_available',
            weight: 100
        },
        {
            route: '/committees',
            displayName: 'Committees',
            icon: 'auto_awesome_mosaic',
            weight: 200
        },
        {
            route: '/members',
            displayName: 'Members',
            icon: 'group',
            permission: OML.can_manage_users,
            weight: 300
        },
        {
            route: '/organization-tags',
            displayName: 'Tags',
            icon: 'local_offer',
            permission: OML.can_manage_organization,
            weight: 250
        },
        {
            route: '/designs',
            displayName: 'Design',
            icon: 'palette',
            permission: OML.can_manage_organization,
            hasDividerBelow: true,
            weight: 350
        },
        {
            route: '/settings',
            displayName: 'Settings',
            icon: 'settings',
            permission: OML.can_manage_organization,
            weight: 400
        }
    ];

    public constructor(
        private authService: AuthService,
        private dialog: MatDialog,
        private menuService: MainMenuService,
        private vp: ViewportService
    ) {}

    public openAccountDialog(): void {
        this.dialog.open(AccountDialogComponent, {
            ...largeDialogSettings
        });
    }

    public logout(): void {
        this.authService.logout();
    }

    public isRouteExact(route: string): boolean {
        return route === '/';
    }

    public closeSidenavOnMobile(): void {
        if (this.vp.isMobile) {
            this.menuService.toggleMenu();
        }
    }
}
