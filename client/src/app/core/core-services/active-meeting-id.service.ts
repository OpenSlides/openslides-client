import { Injectable } from '@angular/core';
import { Router, RouterEvent, RoutesRecognized } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { DataStoreService } from './data-store.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: `root`
})
export class ActiveMeetingIdService {
    public get meetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public get meetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }

    // undefined is for detecting, that this service wasn't loaded yet
    private meetingIdSubject = new BehaviorSubject<number | null>(undefined);

    public constructor(private router: Router, private DS: DataStoreService) {
        this.router.events
            .pipe(
                filter((event: RouterEvent): boolean => event instanceof RoutesRecognized),
                distinctUntilChanged()
            )
            .subscribe((event: RoutesRecognized) => {
                const parts = event.url.split(`/`);
                let meetingId = null;
                if (parts.length >= 2) {
                    meetingId = parts[1];
                }
                this.setMeetingId(meetingId);
            });
    }

    private setMeetingId(newMeetingId: any): void {
        newMeetingId = Number(newMeetingId) || null;

        if (newMeetingId === this.meetingId) {
            return;
        }
        this.DS.clearMeetingModels();
        this.meetingIdSubject.next(newMeetingId);

        /**
         * If the user types in an illegal meeting id, naviagte to /
         */
        if (!newMeetingId) {
            this.router.navigate([`/`]);
        }
    }
}
