import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { AuthService } from 'app/core/core-services/auth.service';
import { OML } from 'app/core/core-services/organization-permission';
import { OverlayService } from 'app/core/ui-services/overlay.service';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';

interface OrgaMenuEntry {
    route: string;
    displayName: string;
    icon: string;
    weight: number;
    permission?: OML;
}

@Component({
    selector: 'os-management-navigation',
    templateUrl: './management-navigation.component.html',
    styleUrls: ['./management-navigation.component.scss']
})
export class ManagementNavigationComponent {
    public menuEntries: OrgaMenuEntry[] = [
        {
            route: '/',
            displayName: 'Dashboard',
            icon: 'dashboard',
            weight: 100
        },
        {
            route: '/committees',
            displayName: 'Committees',
            icon: 'account_balance',
            weight: 200
        },
        {
            route: '/organization-tags',
            displayName: 'Organization tags',
            icon: 'label',
            permission: OML.can_manage_organization,
            weight: 250
        },
        {
            route: '/members',
            displayName: 'Members',
            icon: 'group',
            permission: OML.can_manage_users,
            weight: 300
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
        private overlayService: OverlayService,
        private dialog: MatDialog
    ) {}

    public openAccountDialog(): void {
        this.dialog.open(AccountDialogComponent, {
            ...largeDialogSettings
        });
    }

    public logout(): void {
        this.authService.logout();
        this.overlayService.logout();
    }
}
