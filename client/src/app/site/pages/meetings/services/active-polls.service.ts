import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { viewModelListEqual } from 'src/app/infrastructure/utils';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { PollControllerService } from '../modules/poll/services/poll-controller.service';
import { ViewPoll } from '../pages/polls';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { ACTIVE_POLLS_SUBSCRIPTION, getActivePollsSubscriptionConfig } from './active-polls.subscription';

@Injectable({
    providedIn: `root`
})
export class ActivePollsService {
    public pollIds!: Id[];

    public _pollSubscription: Subscription | null = null;

    private _pollSubject = new BehaviorSubject<ViewPoll[] | null>(null);

    public get activePollsObservable(): Observable<ViewPoll[] | null> {
        return this._pollSubject;
    }

    public get activePolls(): ViewPoll[] | null {
        return this._pollSubject.getValue();
    }

    public constructor(
        private activeMeetingIdService: ActiveMeetingIdService,
        private repo: PollControllerService,
        private modelRequestService: ModelRequestService
    ) {
        this.refreshRepoSubscription();
    }

    private refreshRepoSubscription(): void {
        if (this._pollSubscription) {
            return;
        }

        // Even inaccessible meetings will be observed so that one is on the login-mask available.
        this._pollSubscription = this.repo
            .getViewModelListObservable()
            .pipe(
                map(polls => polls.filter(p => p.isStarted)),
                distinctUntilChanged((l1, l2) => viewModelListEqual(l1, l2, false))
            )
            .subscribe(polls => {
                this.pollIds = polls.map(poll => poll.id);
                this._pollSubject.next(polls);

                if (this.pollIds.length) {
                    this.refreshAutoupdateSubscription();
                } else {
                    this.modelRequestService.closeSubscription(ACTIVE_POLLS_SUBSCRIPTION);
                }
            });
    }

    private async refreshAutoupdateSubscription(): Promise<void> {
        await this.modelRequestService.updateSubscribeTo({
            ...getActivePollsSubscriptionConfig(...this.pollIds),
            hideWhen: this.activeMeetingIdService.meetingIdObservable.pipe(map(id => !id))
        });
    }
}
