import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';

import { MeetingDataStoreService } from './meeting-data-store.service';

export class NoActiveMeetingError extends Error {}

interface MeetingIdDifferEvent {
    currentMeetingId: Id | null;
    nextMeetingId: Id | null;
}

export interface MeetingIdChangedEvent extends MeetingIdDifferEvent {
    hasChanged: boolean;
}

@Injectable({
    providedIn: `root`
})
export class ActiveMeetingIdService {
    public get meetingIdChanged(): Observable<MeetingIdChangedEvent> {
        return this._meetingIdChangedSubject.pipe(
            map(event => ({ ...event, hasChanged: event.currentMeetingId !== event.nextMeetingId }))
        );
    }

    /**
     * Fires, if the meeting id will be changed. It sends the next meeting id.
     */
    public get meetingIdObservable(): Observable<Id | null> {
        return this._meetingIdSubject;
    }

    /**
     * Holds the next meeting id
     */
    public get meetingId(): Id | null {
        return this._meetingIdSubject.value;
    }

    private readonly _meetingIdChangedSubject = new Subject<MeetingIdDifferEvent>();
    // undefined to specify it is not initialized
    private readonly _meetingIdSubject = new BehaviorSubject<Id | null>(undefined);

    public constructor(
        router: Router,
        private DS: MeetingDataStoreService
    ) {
        router.events
            .pipe(
                filter((event): boolean => event instanceof RoutesRecognized),
                distinctUntilChanged()
            )
            .subscribe(event => {
                this.setMeetingId(this.parseUrlMeetingId((event as RoutesRecognized).url));
            });
    }

    /**
     * Returns the meeting id from the current route
     */
    public parseUrlMeetingId(url: string): Id | null {
        const parts = url.split(`/`);
        if (parts.length >= 2) {
            return +parts[1];
        }

        return null;
    }

    private setMeetingId(nextMeetingId: number | null | undefined): void {
        nextMeetingId = Number(nextMeetingId) || null;

        if (nextMeetingId === this.meetingId) {
            return;
        }
        this.DS.clearMeetingModels();
        this._meetingIdChangedSubject.next({ currentMeetingId: this.meetingId, nextMeetingId });
        this._meetingIdSubject.next(nextMeetingId);
    }
}
