import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { ActiveMeetingIdService } from './active-meeting-id.service';
import { Id } from '../definitions/key-types';

@Injectable({
    providedIn: 'root'
})
export class RouteGuard {
    private get activeMeetingId(): Id {
        return this.activeMeetingIdService.meetingId;
    }

    private readonly excludedRoutes = [
        'login',
        'download',
        'projector',
        'committees',
        'members',
        'organization-tags',
        'settings'
    ];

    public constructor(private router: Router, private activeMeetingIdService: ActiveMeetingIdService) {
        this.listenToNavigation();
    }

    private listenToNavigation(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                const paths = event.url.split('/').filter(path => !!path);
                if (
                    !!paths[0] &&
                    !Number(paths[0]) &&
                    !this.excludedRoutes.some(path => paths[0] && paths[0] === path)
                ) {
                    console.warn(`Route "${event.url}" is misleading. Please change.`);
                    this.router.navigate([this.activeMeetingId, ...paths]);
                }
            }
        });
    }
}
