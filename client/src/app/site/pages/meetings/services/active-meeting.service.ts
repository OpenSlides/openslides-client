import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, first, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { BannerDefinition, BannerService } from 'src/app/site/modules/site-wrapper/services/banner.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { LifecycleService } from '../../../services/lifecycle.service';
import { ViewMeeting } from '../view-models/view-meeting';
import { ACTIVE_MEETING_SUBSCRIPTION, getActiveMeetingSubscriptionConfig } from './active-meeting.subscription';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ArchiveStatusService } from './archive-status.service';
import { MeetingControllerService } from './meeting-controller.service';

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
        private modelRequestService: ModelRequestService,
        private router: Router,
        private translate: TranslateService
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
            await this.refreshAutoupdateSubscription();
            this.refreshRepoSubscription();
            this.modelRequestService.subscriptionGotData(ACTIVE_MEETING_SUBSCRIPTION).then(data => {
                if (!data[`meeting`]) {
                    this.router.navigate([`error`], {
                        queryParams: {
                            error: this.translate.instant(`Meeting not found`)
                        }
                    });
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

    private async refreshAutoupdateSubscription(): Promise<void> {
        await this.modelRequestService.updateSubscribeTo({
            ...getActiveMeetingSubscriptionConfig(this.meetingId!),
            hideWhen: this.activeMeetingIdService.meetingIdObservable.pipe(map(id => !id))
        });
    }
}
