import { Injectable } from '@angular/core';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';

import { MeetingRepositoryService } from '../repositories/management/meeting-repository.service';
import { BannerDefinition, BannerService } from '../ui-services/banner.service';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ArchiveStatusService } from './archive-status.service';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { LifecycleService } from './lifecycle.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

export class NoActiveMeeting extends Error {}

@Injectable({
    providedIn: `root`
})
export class ActiveMeetingService {
    public get guestsEnabled(): boolean {
        const activeMeeting = this._meetingSubject.getValue();
        return activeMeeting ? activeMeeting.enable_anonymous : false;
    }

    public get meetingIdObservable(): Observable<number | null> {
        return this.activeMeetingIdService.meetingIdObservable;
    }

    public get meetingId(): number | null {
        return this.activeMeetingIdService.meetingId;
    }

    public get meetingObservable(): Observable<ViewMeeting | null> {
        return this._meetingSubject.asObservable();
    }

    public get meeting(): ViewMeeting | null {
        return this._meetingSubject.getValue();
    }

    protected modelAutoupdateSubscription: ModelSubscription | null = null;

    private _currentArchivedBanner: BannerDefinition | null = null;
    private _meetingSubject = new BehaviorSubject<ViewMeeting | null>(undefined);
    private _meetingSubcription: Subscription = null;

    public constructor(
        private activeMeetingIdService: ActiveMeetingIdService,
        private repo: MeetingRepositoryService,
        private autoupdateService: AutoupdateService,
        private lifecycle: LifecycleService,
        private bannerService: BannerService,
        private archiveService: ArchiveStatusService
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

        if (this._meetingSubcription) {
            this._meetingSubcription.unsubscribe();
        }

        if (id) {
            this.modelAutoupdateSubscription = await this.autoupdateService.subscribe(
                this.getModelRequest(),
                `ActiveMeetingService`
            );
            // Even inaccessible meetings will be observed so that one is on the login-mask available.
            this._meetingSubcription = this.repo
                .getGeneralViewModelObservable()
                .pipe(
                    distinctUntilChanged((prev, curr) => {
                        return JSON.stringify(prev.meeting) === JSON.stringify(curr.meeting);
                    })
                )
                .subscribe(meeting => {
                    if (meeting?.id === this.meetingId) {
                        this.setupActiveMeeting(meeting);
                    }
                });
        } else {
            this.setupActiveMeeting(null);
        }
    }

    private setupActiveMeeting(meeting: ViewMeeting | null): void {
        this._meetingSubject.next(meeting);
        if (meeting?.isArchived) {
            this.archiveService.isArchivedEvent.next(true);
            this._currentArchivedBanner = this.createArchivedBanner();
            this.bannerService.addBanner(this._currentArchivedBanner);
        } else if (this._currentArchivedBanner) {
            this.archiveService.isArchivedEvent.next(false);
            this.bannerService.removeBanner(this._currentArchivedBanner);
            this._currentArchivedBanner = null;
        }
    }

    private createArchivedBanner(): BannerDefinition {
        return {
            icon: `archive`,
            class: `background-warn`,
            text: `Archived`
        };
    }

    private getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.meetingId],
            follow: [
                { idField: `default_group_id` }, // needed by the operator!
                { idField: `admin_group_id` },
                {
                    idField: `projector_ids`,
                    follow: [
                        { idField: `current_projection_ids`, follow: [{ idField: `content_object_id` }] },
                        { idField: `preview_projection_ids`, follow: [{ idField: `content_object_id` }] }
                    ]
                },
                {
                    // needed for the voting-banner
                    idField: `poll_ids`,
                    fieldset: `list`,
                    additionalFields: [`voted_ids`],
                    follow: [{ idField: `content_object_id` }]
                },
                { idField: `default_projector_$_id` }
            ],
            fieldset: `settings`,
            additionalFields: [
                { templateField: `logo_$_id` }, // needed by the media manage service
                { templateField: `font_$_id` },
                `reference_projector_id`,
                `is_active_in_organization_id`
            ]
        };
    }
}
