import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, firstValueFrom, distinctUntilChanged, first, map } from 'rxjs';
import { ViewMeeting } from '../view-models/view-meeting';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { LifecycleService } from '../../../services/lifecycle.service';
import { MeetingControllerService } from './meeting-controller.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { ArchiveStatusService } from './archive-status.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { Id } from 'src/app/domain/definitions/key-types';
import { getProjectorListSubscriptionConfig } from '../pages/projectors/config/model-subscription';
import { getParticipantSubscriptionConfig } from '../pages/participants/config/model-subscription';
import { BannerDefinition, BannerService } from 'src/app/site/modules/site-wrapper/services/banner.service';

const MEETING_DETAIL_SUBSCRIPTION = `meeting_detail`;
const MEETING_DETAIL_GROUP_SUBSCRIPTION = `meeting_detail_group`; // Used for the active meeting service
const MEETING_DETAIL_MEDIAFILES_SUBSCRIPTION = `meeting_detail_mediafiles`;

const getMediafilesSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`mediafile_ids`]
    },
    subscriptionName: MEETING_DETAIL_MEDIAFILES_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

const getMeetingDetailSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            `chat_group_ids`,
            `chat_message_ids`,
            { idField: `poll_ids` },
            `group_ids`,
            { idField: `option_ids`, follow: [`content_object_id`] },
            `vote_ids`
        ]
    },
    subscriptionName: MEETING_DETAIL_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

const getMeetingDetailGroupSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: `group`
    },
    subscriptionName: MEETING_DETAIL_GROUP_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

@Injectable({
    providedIn: 'root'
})
export class ActiveMeetingService {
    public get guestsEnabled(): boolean {
        const activeMeeting = this._meetingSubject.getValue();
        return activeMeeting ? activeMeeting.enable_anonymous : false;
    }

    public get meetingIdObservable(): Observable<Id | null> {
        return this.activeMeetingIdService.meetingIdObservable;
    }

    public get meetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    public get meetingObservable(): Observable<ViewMeeting | null> {
        return this._meetingSubject.asObservable();
    }

    public get meeting(): ViewMeeting | null {
        return this._meetingSubject.getValue();
    }

    private _currentArchivedBanner: BannerDefinition | null = null;
    private _meetingSubject = new BehaviorSubject<ViewMeeting | null>(null);
    private _meetingSubcription: Subscription | null = null;

    public constructor(
        private activeMeetingIdService: ActiveMeetingIdService,
        private repo: MeetingControllerService,
        private lifecycle: LifecycleService,
        private bannerService: BannerService,
        private archiveService: ArchiveStatusService,
        private modelRequestService: ModelRequestService
    ) {
        this.activeMeetingIdService.meetingIdObservable.subscribe(id => {
            if (id !== undefined) {
                this.setupModelSubscription(id);
            }
        });
        this.lifecycle.openslidesBooted.subscribe(() => this.setupModelSubscription(this.meetingId));
    }

    public async ensureActiveMeetingIsAvailable(): Promise<ViewMeeting | null> {
        if (!!this.meetingId) {
            return firstValueFrom(this.meetingObservable.pipe(first(meeting => !!meeting)));
        }
        return null;
    }

    private async setupModelSubscription(id: number | null): Promise<void> {
        if (!!this.meetingId) {
            this.refreshAutoupdateSubscription();
            this.refreshRepoSubscription();
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

    private refreshRepoSubscription(): void {
        if (this._meetingSubcription) {
            return;
        }

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
    }

    private async refreshAutoupdateSubscription(): Promise<void> {
        this.modelRequestService.subscribeTo(
            getMeetingDetailGroupSubscriptionConfig(
                this.meetingId!,
                () => this.activeMeetingIdService.meetingIdObservable
            )
        );
        this.modelRequestService.subscribeTo(
            getMeetingDetailSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable)
        );
        this.modelRequestService.subscribeTo(
            getMediafilesSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable)
        );
        this.modelRequestService.subscribeTo(
            getProjectorListSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable)
        );
        this.modelRequestService.subscribeTo(
            getParticipantSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable)
        );
    }
}
