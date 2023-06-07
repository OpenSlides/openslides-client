import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Settings } from '../../../../domain/models/meetings/meeting';
import { CustomTranslationService } from '../../../modules/translations/custom-translation.service';
import { ViewMeeting } from '../view-models/view-meeting';
import { ActiveMeetingService } from './active-meeting.service';

@Injectable({
    providedIn: `root`
})
export class MeetingSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    /**
     * Listen for changes of setting variables.
     */
    public constructor(
        private activeMeetingService: ActiveMeetingService,
        customTranslationService: CustomTranslationService
    ) {
        this.activeMeetingService.meetingObservable.subscribe(meeting => {
            if (meeting) {
                for (const key of Object.keys(this.settingSubjects)) {
                    this.settingSubjects[key].next(meeting[key as keyof ViewMeeting]);
                }
            }
        });
        this.get(`custom_translations`).subscribe(customTranslations =>
            customTranslationService.customTranslationSubject.next(customTranslations)
        );
    }

    /**
     * Get the constant named by key from the DataStore. If the DataStore isn't up to date or
     * not filled via autoupdates the results may be wrong/empty. Use this with caution.
     *
     * Usefull for synchronos code, e.g. during generation of PDFs, when the DataStore is filled.
     *
     * @param key The setting value to get from.
     */
    public instant<T extends keyof Settings>(key: T): Settings[T] | null {
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
        return this.settingSubjects[key] as Observable<Settings[T]>;
    }
}
