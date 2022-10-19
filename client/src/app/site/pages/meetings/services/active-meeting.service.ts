import { Injectable } from '@angular/core';
import { BehaviorSubject, first, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { BannerDefinition, BannerService } from 'src/app/site/modules/site-wrapper/services/banner.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { LifecycleService } from '../../../services/lifecycle.service';
import { getParticipantSubscriptionConfig } from '../pages/participants/config/model-subscription';
import { getProjectorListSubscriptionConfig } from '../pages/projectors/config/model-subscription';
import { ViewMeeting } from '../view-models/view-meeting';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ArchiveStatusService } from './archive-status.service';
import { MeetingControllerService } from './meeting-controller.service';

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
            { idField: `poll_ids`, follow: [`content_object_id`] },
            `group_ids`,
            { idField: `option_ids`, follow: [`content_object_id`], additionalFields: [`text`] },
            `vote_ids`,
            { idField: `committee_id`, additionalFields: [`name`] }
        ],
        additionalFields: [`jitsi_domain`, `jitsi_room_name`, `jitsi_room_password`]
    },
    subscriptionName: MEETING_DETAIL_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

const getMeetingDetailGroupSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: `group`,
        follow: [`group_ids`]
    },
    subscriptionName: MEETING_DETAIL_GROUP_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id)),
    isDelayed: false
});

@Injectable({
    providedIn: `root`
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
        this.lifecycle.openslidesBooted.subscribe();
    }

    /**
     * Only used in the `OperatorService`
     */
    public async ensureActiveMeetingIsAvailable(): Promise<ViewMeeting | null> {
        if (!!this.meetingId) {
            return await firstValueFrom(
                this.meetingObservable.pipe(first(meeting => !!meeting && !!meeting.group_ids))
            );
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
        this._meetingSubcription = this.repo.getGeneralViewModelObservable().subscribe(meeting => {
            if (meeting?.id === this.meetingId) {
                this.setupActiveMeeting(meeting);
            }
        });
    }

    private getHasMeetingIdChangedObservable(): Observable<boolean> {
        return this.activeMeetingIdService.meetingIdChanged.pipe(map(event => event.hasChanged));
    }

    private async refreshAutoupdateSubscription(): Promise<void> {
        this.modelRequestService.updateSubscribeTo(
            getMeetingDetailGroupSubscriptionConfig(
                this.meetingId!,
                () => this.activeMeetingIdService.meetingIdObservable
            ),
            getMeetingDetailSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable),
            getMediafilesSubscriptionConfig(this.meetingId!, () => this.activeMeetingIdService.meetingIdObservable),
            getProjectorListSubscriptionConfig(this.meetingId!, () => this.getHasMeetingIdChangedObservable()),
            getParticipantSubscriptionConfig(this.meetingId!, () => this.getHasMeetingIdChangedObservable())
        );
    }
}
