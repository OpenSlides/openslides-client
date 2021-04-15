import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { AuthService } from 'app/core/core-services/auth.service';
import { MainMenuEntry } from 'app/core/core-services/main-menu.service';
import { OverlayService } from 'app/core/ui-services/overlay.service';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';

@Component({
    selector: 'os-management-navigation',
    templateUrl: './management-navigation.component.html',
    styleUrls: ['./management-navigation.component.scss']
})
export class ManagementNavigationComponent {
    public menuEntries: MainMenuEntry[] = [
        {
            route: '/',
            displayName: 'Dashboard',
            icon: 'dashboard',
            // permission: Permission.coreCanSeeFrontpage,
            weight: 100
        },
        {
            route: '/committees',
            displayName: 'Committees',
            icon: 'account_balance',
            // permission: Permission.coreCanSeeFrontpage,
            weight: 200
        },
        {
            route: '/members',
            displayName: 'Members',
            icon: 'group',
            // permission: Permission.coreCanSeeFrontpage,
            weight: 300
        },
        {
            route: '/settings',
            displayName: 'Settings',
            icon: 'settings',
            // permission: Permission.coreCanSeeFrontpage,
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
