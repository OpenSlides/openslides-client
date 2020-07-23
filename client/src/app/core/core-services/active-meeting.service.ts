import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Meeting } from 'app/shared/models/event-management/meeting';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { MeetingRepositoryService } from '../repositories/event-management/meeting-repository.service';
import { DEFAULT_FIELDSET, SimplifiedModelRequest } from './model-request-builder.service';

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingService {
    private meetingIdSubject = new BehaviorSubject<number | null>(null);

    private meetingSubject = new BehaviorSubject<ViewMeeting | null>(null);
    private meetingSubcription: Subscription;

    protected modelSubscription: ModelSubscription | null = null;

    public constructor(private repo: MeetingRepositoryService, private autoupdateService: AutoupdateService) {
        this.meetingIdSubject.subscribe(id => {
            this.closeModelSubscription();
            if (id) {
                this.requestModel();

                if (this.meetingSubcription) {
                    this.meetingSubcription.unsubscribe();
                }
                this.meetingSubcription = this.repo.getViewModelObservable(id).subscribe(meeting => {
                    this.meetingSubject.next(meeting);
                });
            } else {
                this.meetingSubject.next(null);
            }
        });

        this.meetingIdSubject.next(1);
    }

    public getMeetingIdObservable(): Observable<number | null> {
        return this.meetingIdSubject.asObservable();
    }

    public getMeetingId(): number | null {
        return this.meetingIdSubject.getValue();
    }

    public getMeetingObservable(): Observable<ViewMeeting | null> {
        return this.meetingSubject.asObservable();
    }

    public getMeeting(): ViewMeeting | null {
        return this.meetingSubject.getValue();
    }

    private getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.getMeetingId()],
            fieldset: 'settings'
        };
    }

    private async requestModel(): Promise<void> {
        this.closeModelSubscription();
        this.modelSubscription = await this.autoupdateService.simpleRequest(this.getModelRequest());
    }

    private closeModelSubscription(): void {
        if (this.modelSubscription) {
            this.modelSubscription.close();
            this.modelSubscription = null;
        }
    }
}
