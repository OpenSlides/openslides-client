import { inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { MeetingPollDefault } from '@app/domain/models/meetings/meeting-poll-default';
import { BehaviorSubject, combineLatest, filter, Observable, switchMap } from 'rxjs';

import { ActiveMeetingService } from './active-meeting.service';

type MeetingPollSettingCollection = 'motion' | 'topic' | 'assignment';

@Service()
export class MeetingPollSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSignals: Record<MeetingPollSettingCollection, Record<string, WritableSignal<any>>> = {
        assignment: {},
        motion: {},
        topic: {}
    };

    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: Record<MeetingPollSettingCollection, Record<string, BehaviorSubject<any>>> = {
        assignment: {},
        motion: {},
        topic: {}
    };

    private activeMeetingService = inject(ActiveMeetingService);

    /**
     * Listen for changes of setting variables.
     */
    public constructor() {
        this.activeMeetingService.meetingObservable
            .pipe(
                filter(m => !!m),
                switchMap(m => {
                    return combineLatest([m.assignment_poll_config$, m.motion_poll_config$, m.topic_poll_config$]);
                })
            )
            .subscribe(([assignmentPollConfig, motionPollConfig, topicPollConfig]) => {
                if (assignmentPollConfig) {
                    for (const key of Object.keys(this.settingSubjects[`assignment`])) {
                        if (this.settingSubjects[`assignment`][key].getValue() !== assignmentPollConfig[key]) {
                            this.settingSubjects[`assignment`][key].next(assignmentPollConfig[key]);
                        }
                    }

                    for (const key of Object.keys(this.settingSignals[`assignment`])) {
                        if (this.settingSignals[`assignment`][key]() !== assignmentPollConfig[key]) {
                            this.settingSignals[`assignment`][key].set(assignmentPollConfig[key]);
                        }
                    }
                }

                if (motionPollConfig) {
                    for (const key of Object.keys(this.settingSubjects[`motion`])) {
                        if (this.settingSubjects[`motion`][key].getValue() !== motionPollConfig[key]) {
                            this.settingSubjects[`motion`][key].next(motionPollConfig[key]);
                        }
                    }

                    for (const key of Object.keys(this.settingSignals[`motion`])) {
                        if (this.settingSignals[`motion`][key]() !== motionPollConfig[key]) {
                            this.settingSignals[`motion`][key].set(motionPollConfig[key]);
                        }
                    }
                }

                if (topicPollConfig) {
                    for (const key of Object.keys(this.settingSubjects[`topic`])) {
                        if (this.settingSubjects[`topic`][key].getValue() !== topicPollConfig[key]) {
                            this.settingSubjects[`topic`][key].next(topicPollConfig[key]);
                        }
                    }

                    for (const key of Object.keys(this.settingSignals[`topic`])) {
                        if (this.settingSignals[`topic`][key]() !== topicPollConfig[key]) {
                            this.settingSignals[`topic`][key].set(topicPollConfig[key]);
                        }
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
    public instant<T extends keyof MeetingPollDefault>(
        collection: MeetingPollSettingCollection,
        key: T
    ): MeetingPollDefault[T] | null {
        return this.activeMeetingService.meeting[`${collection}_poll_config`][key];
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public get<T extends keyof MeetingPollDefault>(
        collection: MeetingPollSettingCollection,
        key: T
    ): Observable<MeetingPollDefault[T]> {
        if (!this.settingSubjects[collection][key]) {
            this.settingSubjects[collection][key] = new BehaviorSubject<any>(this.instant(collection, key));
        }
        return this.settingSubjects[collection][key] as Observable<MeetingPollDefault[T]>;
    }

    /**
     * Get a signal for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public signal<T extends keyof MeetingPollDefault>(
        collection: MeetingPollSettingCollection,
        key: T
    ): Signal<MeetingPollDefault[T]> {
        if (!this.settingSignals[collection][key]) {
            this.settingSignals[collection][key] = signal<MeetingPollDefault[T]>(this.instant(collection, key));
        }
        return this.settingSignals[collection][key] as Signal<MeetingPollDefault[T]>;
    }
}
