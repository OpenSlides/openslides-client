import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Id } from 'app/core/definitions/key-types';

import { ActiveMeetingService } from './active-meeting.service';

const URL_LOGIN_PREFIX = `/login`;

@Injectable({ providedIn: `root` })
export class OpenSlidesRouterService {
    private get isAnonymousEnabled(): boolean {
        return this.activeMeeting.guestsEnabled;
    }

    private get activeMeetingId(): Id {
        return this.activeMeeting.meetingId;
    }

    public constructor(private activeMeeting: ActiveMeetingService, private router: Router) {}

    public navigateToLogin(meetingId: Id = this.activeMeetingId): void {
        const url = this.router.routerState.snapshot.url;
        const urlFragments = url.split(`/`);

        // First, check if a user is already at the login page
        if (url.startsWith(URL_LOGIN_PREFIX) && url.length > URL_LOGIN_PREFIX.length) {
            return;
        }

        // Then, check if a user is at any orga-specific route
        // if the first fragment is a number, we are in a meeting
        if (!/\d+/g.test(urlFragments[1]) || !meetingId) {
            this.router.navigate([`login`]);
            return;
        }
        if (this.isAnonymousEnabled) {
            this.router.navigate([`${meetingId}/`]);
        } else {
            this.router.navigate([meetingId, `login`]);
        }
    }
}
