import { Component, OnInit } from '@angular/core';

import { AuthService } from 'app/core/core-services/auth.service';
import { MainMenuEntry } from 'app/core/core-services/main-menu.service';
import { OverlayService } from 'app/core/ui-services/overlay.service';

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
            route: '/',
            displayName: 'Settings',
            icon: 'settings',
            // permission: Permission.coreCanSeeFrontpage,
            weight: 400
        }
    ];

    public constructor(private authService: AuthService, private overlayService: OverlayService) {}

    public logout(): void {
        this.authService.logout();
        this.overlayService.logout();
    }
}
