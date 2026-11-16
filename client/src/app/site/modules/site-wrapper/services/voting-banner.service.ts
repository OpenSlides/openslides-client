import { inject, Service } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { viewModelListEqual } from '@app/infrastructure/utils';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { ActiveMeetingService } from '@app/site/pages/meetings/services/active-meeting.service';
import { ActivePollsService } from '@app/site/pages/meetings/services/active-polls.service';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from '@app/site/services/operator.service';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable, of, switchMap } from 'rxjs';

import { BannerDefinition, BannerService } from './banner.service';

interface BannerCreationData {
    text: string;
    link: string;
}

@Service()
export class VotingBannerService {
    private currentBanner: BannerDefinition;

    private subText = _(`Click here to vote!`);

    private pollsToVote: ViewPoll[] = [];

    private banner = inject(BannerService);
    private translate = inject(TranslateService);
    private activeMeeting = inject(ActiveMeetingService);
    private pollRepo = inject(PollRepositoryService);
    private operator = inject(OperatorService);
    private activePolls = inject(ActivePollsService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        combineLatest([
            this.activeMeeting.meetingIdObservable.pipe(distinctUntilChanged()),
            this.activePolls.activePollsObservable.pipe(
                distinctUntilChanged((l1, l2) => viewModelListEqual(l1, l2, false))
            ),
            this.meetingSettingsService.get(`users_enable_vote_delegations`).pipe(distinctUntilChanged()),
            this.meetingSettingsService.get(`users_forbid_delegator_to_vote`).pipe(distinctUntilChanged()),
            this.operator.userObservable.pipe(
                distinctUntilChanged((p, c) => p?.isPresentInMeeting() === c?.isPresentInMeeting())
            )
        ])
            .pipe(
                map(([_, polls]) => polls),
                switchMap(polls => {
                    if (!polls.length) {
                        return of([]);
                    }

                    return this.subscribeVoted(...polls);
                })
            )
            .subscribe(polls => this.updateBanner(polls));
    }

    private subscribeVoted(...viewPolls: ViewPoll[]): Observable<[ViewPoll, boolean][]> {
        const userIds = [
            this.operator.user.getMeetingUser()?.id,
            ...(this.operator.user.vote_delegations_from_meeting_user_ids() || [])
        ];
        return combineLatest(
            viewPolls.map(poll => {
                return combineLatest(userIds.map(userId => this.pollRepo.pollBallotUsersByUser(poll.id, userId))).pipe(
                    map(ballots => !!ballots.map(b => !!b.length).some(b => b))
                );
            })
        ).pipe(
            map(voted => {
                return viewPolls.map((p, i) => [p, voted[i]]);
            })
        );
    }

    private updateBanner(polls: [ViewPoll, boolean][]): void {
        if (this.activeMeeting.meetingId && !this.operator.isAnonymous && this.operator.readyDeferred.wasResolved) {
            this.pollsToVote = polls
                .filter(([_, voted]) => {
                    return voted === false;
                })
                .map(([poll, _]) => poll);
        } else {
            this.pollsToVote = [];
        }

        // display no banner if no polls to vote
        if (!this.pollsToVote.length) {
            this.sliceBanner();
            return;
        }

        const { text, link } = this.getBannerCreationData();
        const banner = this.createBanner(text, link);
        this.sliceBanner(banner);
    }

    /**
     * Creates a new `BannerDefinition` and returns it.
     *
     * @param text The text for the banner.
     * @param link The link for the banner.
     *
     * @returns The created banner.
     */
    private createBanner(text: string, link: string): BannerDefinition {
        return {
            text,
            subText: this.subText,
            link,
            icon: `how_to_vote`,
            largerOnMobileView: true
        };
    }

    private getBannerCreationData(): BannerCreationData {
        const isSinglePoll = this.pollsToVote.length === 1;
        const text = isSinglePoll
            ? this.getTextForPoll(this.getSinglePoll())
            : `${this.pollsToVote.length} ${this.translate.instant(`open votes`)}`;
        const link = this.getPollOverviewUrl(isSinglePoll);
        return { text, link };
    }

    private getPollOverviewUrl(isSinglePoll: boolean): string {
        if (this.operator.hasPerms(Permission.meetingCanSeeAutopilot)) {
            return `/${this.activeMeeting.meetingId}/autopilot/`;
        } else if (isSinglePoll) {
            return this.pollsToVote[0].getDetailStateUrl();
        }
        return `/${this.activeMeeting.meetingId}/polls/`;
    }

    private getSinglePoll(): ViewPoll {
        return this.pollsToVote[0];
    }

    /**
     * Returns for a given poll a title for the banner.
     *
     * @param poll The given poll.
     *
     * @returns The title.
     */
    private getTextForPoll(poll: ViewPoll): string {
        const contentObject = poll.getContentObject();
        if (contentObject) {
            return contentObject.getVotingText({ poll, translateFn: text => this.translate.instant(text) });
        } else {
            return this.translate.instant(`Voting opened`);
        }
    }

    /**
     * Removes the current banner or replaces it, if a new one is given.
     *
     * @param nextBanner Optional the next banner to show.
     */
    private sliceBanner(nextBanner?: BannerDefinition): void {
        if (nextBanner) {
            this.banner.replaceBanner(this.currentBanner, nextBanner);
        } else {
            this.banner.removeBanner(this.currentBanner);
        }
        this.currentBanner = nextBanner || null;
    }
}
