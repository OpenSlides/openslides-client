import { Injectable } from '@angular/core';
import { ActiveMeetingService } from './active-meeting.service';
import { Router } from '@angular/router';
import { Id } from 'app/core/definitions/key-types';

@Injectable({ providedIn: 'root' })
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
        const urlFragments = url.split('/');

        // First, check if a user is at any orga-specific route
        // if the first fragment is a number, we are in a meeting
        if (!/\d+/g.test(urlFragments[1]) || !meetingId) {
            this.router.navigate(['login']);
            return;
        }
        if (this.isAnonymousEnabled) {
            this.router.navigate([`${meetingId}/`]);
        } else {
            this.router.navigate([meetingId, 'login']);
        }
    }
}
