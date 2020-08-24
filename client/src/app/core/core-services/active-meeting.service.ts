import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { LifecycleService } from './lifecycle.service';
import { MeetingRepositoryService } from '../repositories/event-management/meeting-repository.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingService {
    private meetingIdSubject = new BehaviorSubject<number | null>(null);
    private meetingIdSubscription: Subscription = null;

    private meetingSubject = new BehaviorSubject<ViewMeeting | null>(null);
    private meetingSubcription: Subscription = null;

    protected modelAutoupdateSubscription: ModelSubscription | null = null;

    public get guestsEnabled(): boolean {
        const activeMeeting = this.meetingSubject.getValue();
        return activeMeeting ? activeMeeting.enable_anonymous : false;
    }

    public get meetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public get meetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }

    public get meetingObservable(): Observable<ViewMeeting | null> {
        return this.meetingSubject.asObservable();
    }

    public get meeting(): ViewMeeting | null {
        return this.meetingSubject.getValue();
    }

    public constructor(
        private repo: MeetingRepositoryService,
        private autoupdateService: AutoupdateService,
        private lifecycleService: LifecycleService
    ) {
        this.lifecycleService.openslidesBooted.subscribe(() => this.start());
    }

    public start(): void {
        if (this.meetingIdSubscription) {
            this.meetingIdSubscription.unsubscribe();
            this.meetingIdSubscription = null;
        }
        this.meetingIdSubscription = this.meetingIdSubject.subscribe(id => this.setupModelSubscription(id));

        this.meetingIdSubject.next(1);
    }

    private async setupModelSubscription(id: number | null): Promise<void> {
        if (this.modelAutoupdateSubscription) {
            this.modelAutoupdateSubscription.close();
            this.modelAutoupdateSubscription = null;
        }

        if (id) {
            this.modelAutoupdateSubscription = await this.autoupdateService.simpleRequest(this.getModelRequest());

            if (this.meetingSubcription) {
                this.meetingSubcription.unsubscribe();
            }
            this.meetingSubcription = this.repo.getViewModelObservable(id).subscribe(meeting => {
                this.meetingSubject.next(meeting);
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
                { idField: 'superadmin_group_id' },
                { idField: 'logo_$_id', onlyValues: true }, // needed by the media manage service
                { idField: 'font_$_id', onlyValues: true }
            ],
            fieldset: 'settings'
        };
    }
}
