import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingService {
    private meetingIdSubject = new BehaviorSubject<number | null>(null);

    public constructor() {
        this.meetingIdSubject.next(1);
    }

    public getMeetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public getMeetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }
}
