import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, filter, distinctUntilChanged } from 'rxjs';
import { RoutesRecognized, Router } from '@angular/router';
import { MeetingDataStoreService } from './meeting-data-store.service';

export class NoActiveMeetingError extends Error {}

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingIdService {
    public get meetingIdObservable(): Observable<number | null> {
        return this._meetingIdSubject.asObservable();
    }

    public get meetingId(): number | null {
        return this._meetingIdSubject.getValue();
    }

    // undefined is for detecting, that this service wasn't loaded yet
    private _meetingIdSubject = new BehaviorSubject<number | null>(null);

    public constructor(router: Router, private DS: MeetingDataStoreService) {
        router.events
            .pipe(
                filter((event): boolean => event instanceof RoutesRecognized),
                distinctUntilChanged()
            )
            .subscribe(event => {
                const parts = (event as RoutesRecognized).url.split(`/`);
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
        this._meetingIdSubject.next(newMeetingId);
    }
}
