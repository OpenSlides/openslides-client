import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { Meeting, Settings } from 'app/shared/models/event-management/meeting';

/**
 * Handler for setting variables for organsations.
 *
 * @example
 * ```ts
 * this.MeetingSettingsService.get('general_event_name').subscribe(value => {
 *     console.log(value);
 * });
 * ```
 *
 * @example
 * ```ts
 * const value = this.MeetingSettingsService.instant('general_event_name');
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class MeetingSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    /**
     * Listen for changes of setting variables.
     */
    public constructor(private activeMeetingService: ActiveMeetingService) {
        this.activeMeetingService.meetingObservable.subscribe(meeting => {
            if (meeting) {
                for (const key of Object.keys(this.settingSubjects)) {
                    this.settingSubjects[key].next(meeting[key]);
                }
            }
        });
    }

    /**
     * Get the constant named by key from the DataStore. If the DataStore isn't up to date or
     * not filled via autoupdates the results may be wrong/empty. Use this with caution.
     *
     * Usefull for synchronos code, e.g. during generation of PDFs, when the DataStore is filled.
     *
     * @param key The setting value to get from.
     */
    public instant<T extends keyof Settings>(key: T): Settings[T] {
        const meeting = this.activeMeetingService.meeting;
        return meeting ? meeting[key] : null;
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public get<T extends keyof Settings>(key: T): Observable<Settings[T]> {
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(this.instant(key));
        }
        return this.settingSubjects[key].asObservable() as Observable<Settings[T]>;
    }
}
