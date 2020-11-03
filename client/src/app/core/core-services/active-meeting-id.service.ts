import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { LifecycleService } from './lifecycle.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingIdService {
    // undefined is for detecting, that this service wasn't loaded yet
    private meetingIdSubject = new BehaviorSubject<number | null>(undefined);

    public get meetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public get meetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }

    public constructor(private lifecycleService: LifecycleService) {
        this.lifecycleService.openslidesBooted.subscribe(() => this.start());
    }

    public start(): void {
        this.meetingIdSubject.next(1);
    }
}
