import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { LifecycleService } from './lifecycle.service';
import { MeetingRepositoryService } from '../repositories/management/meeting-repository.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingService {
    private meetingSubject = new BehaviorSubject<ViewMeeting | null>(undefined);
    private meetingSubcription: Subscription = null;

    protected modelAutoupdateSubscription: ModelSubscription | null = null;

    public get guestsEnabled(): boolean {
        const activeMeeting = this.meetingSubject.getValue();
        return activeMeeting ? activeMeeting.enable_anonymous : false;
    }

    public get meetingIdObservable(): Observable<number | null> {
        return this.activeMeetingIdService.meetingIdObservable;
    }

    public get meetingId(): number | null {
        return this.activeMeetingIdService.meetingId;
    }

    public get meetingObservable(): Observable<ViewMeeting | null> {
        return this.meetingSubject.asObservable();
    }

    public get meeting(): ViewMeeting | null {
        return this.meetingSubject.getValue();
    }

    public constructor(
        private activeMeetingIdService: ActiveMeetingIdService,
        private repo: MeetingRepositoryService,
        private autoupdateService: AutoupdateService,
        private lifecycle: LifecycleService
    ) {
        this.activeMeetingIdService.meetingIdObservable.subscribe(id => {
            if (id !== undefined) {
                this.setupModelSubscription(id);
            }
        });
        this.lifecycle.openslidesBooted.subscribe(() => this.setupModelSubscription(this.meetingId));
    }

    public async ensureActiveMeetingIsAvailable(): Promise<ViewMeeting> {
        if (!!this.meetingId) {
            return this.meetingObservable.pipe(first()).toPromise();
        }
    }

    private async setupModelSubscription(id: number | null): Promise<void> {
        if (this.modelAutoupdateSubscription) {
            this.modelAutoupdateSubscription.close();
            this.modelAutoupdateSubscription = null;
        }

        if (this.meetingSubcription) {
            this.meetingSubcription.unsubscribe();
        }

        if (id) {
            this.modelAutoupdateSubscription = await this.autoupdateService.subscribe(
                this.getModelRequest(),
                'ActiveMeetingService'
            );
            // Even inaccessible meetings will be observed so that one is on the login-mask available.
            this.meetingSubcription = this.repo.getGeneralViewModelObservable().subscribe(meeting => {
                if (meeting !== undefined && meeting.id === this.meetingId) {
                    this.meetingSubject.next(meeting);
                }
            });
        } else {
            this.meetingSubject.next(null);
        }
    }

    private getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.meetingId],
            follow: [
                { idField: 'default_group_id' }, // needed by the operator!
                { idField: 'admin_group_id' },
                {
                    idField: 'projector_ids',
                    follow: [
                        { idField: 'current_projection_ids', follow: [{ idField: 'content_object_id' }] },
                        { idField: 'preview_projection_ids', follow: [{ idField: 'content_object_id' }] }
                    ]
                },
                {
                    // needed for the voting-banner
                    idField: 'poll_ids',
                    fieldset: 'list',
                    additionalFields: ['voted_ids'],
                    follow: [{ idField: 'content_object_id' }]
                },
                { idField: 'default_projector_$_id' }
            ],
            fieldset: 'settings',
            additionalFields: [
                { templateField: 'logo_$_id' }, // needed by the media manage service
                { templateField: 'font_$_id' },
                'reference_projector_id'
            ]
        };
    }
}
