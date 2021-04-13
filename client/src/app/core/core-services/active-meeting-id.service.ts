import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LifecycleService } from './lifecycle.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingIdService {
    public get meetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public get meetingHasChangedObservable(): Observable<void> {
        return this.meetingHasChangedSubject.asObservable();
    }

    public get meetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }

    private set _meetingId(newMeetingId: number | null) {
        if (Number.isNaN(newMeetingId)) {
            this.currentMeetingId = null;
            this.meetingIdSubject.next(null);
        } else if (newMeetingId && newMeetingId !== this.currentMeetingId) {
            this.currentMeetingId = newMeetingId;
            this.meetingIdSubject.next(newMeetingId);
        }
        if (Number.isNaN || (newMeetingId && newMeetingId !== this.currentMeetingId)) {
            this.meetingHasChangedSubject.next();
        }
    }

    // undefined is for detecting, that this service wasn't loaded yet
    private meetingIdSubject = new BehaviorSubject<number | null>(undefined);
    private meetingHasChangedSubject = new Subject<void>();

    private currentMeetingId: number;

    private routerSub: Subscription;

    public constructor(private lifecycleService: LifecycleService, private router: Router) {
        this.lifecycleService.openslidesBooted.subscribe(() => this.start());
        this.lifecycleService.openslidesShutdowned.subscribe(() => this.shutDown());
    }

    public start(): void {
        this._meetingId = 1;
        this.routerSub = this.router.events
            .pipe(
                filter((event: RouterEvent): boolean => {
                    return event instanceof NavigationEnd;
                })
            )
            .subscribe(() => {
                const params = this.router.routerState.snapshot.root.firstChild.params;
                this._meetingId = Number(params.meetingId);
            });
    }

    private shutDown(): void {
        this.meetingIdSubject.next(undefined);
        this.routerSub?.unsubscribe();
    }
}
