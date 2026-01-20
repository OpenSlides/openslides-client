import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { viewModelListEqual } from 'src/app/infrastructure/utils';
import { VoteControllerService } from 'src/app/site/pages/meetings/modules/poll/services/vote-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ActivePollsService } from 'src/app/site/pages/meetings/services/active-polls.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BannerDefinition, BannerService } from './banner.service';
import { SiteWrapperServiceModule } from './site-wrapper-service.module';

interface BannerCreationData {
    text: string;
    link: string;
}

@Injectable({
    providedIn: SiteWrapperServiceModule
})
export class VotingBannerService {
    private currentBanner: BannerDefinition;

    private subText = _(`Click here to vote!`);

    private pollsToVote: ViewPoll[] = [];
    private pollsToVoteSubscription: Subscription;

    public constructor(
        private banner: BannerService,
        private translate: TranslateService,
        private votingService: VotingService,
        private activeMeeting: ActiveMeetingService,
        private sendVotesService: VoteControllerService,
        private operator: OperatorService,
        private activePolls: ActivePollsService,
        private meetingSettingsService: MeetingSettingsService
    ) {
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
        ]).subscribe(([_, polls]) => this.updateVotablePollSubscription(polls));
    }

    private async updateVotablePollSubscription(polls: ViewPoll[]): Promise<void> {
        this.pollsToVoteSubscription?.unsubscribe();

        this.pollsToVoteSubscription = this.sendVotesService.subscribeVoted(...polls).subscribe(voted => {
            this.updateBanner(polls, voted);
        });
    }

    private updateBanner(polls: ViewPoll[], voted: Record<Id, Id[]>): void {
        if (this.activeMeeting.meetingId && !this.operator.isAnonymous && this.operator.readyDeferred.wasResolved) {
            const checkUsers = [this.operator.user, ...(this.operator.user.vote_delegations_from() || [])];
            this.pollsToVote = polls.filter(
                poll => checkUsers.some(user => this.votingService.canVote(poll, user)) && voted[poll.id] !== undefined
            );
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
        let link: string;
        if (this.operator.hasPerms(Permission.meetingCanSeeAutopilot)) {
            if (!isSinglePoll) {
                link = `/${this.activeMeeting.meetingId}/autopilot/`;
            } else {
                const poll: ViewPoll = this.pollsToVote[0];
                link = this.getPollComponent(poll);
            }
        } else {
            link = `/${this.activeMeeting.meetingId}/polls/`;
            console.log('1<POLLSINPERMISO');
        }
        return { text, link };
    }

    private getPollComponent(poll: ViewPoll): string {
        switch (poll !== null) {
            case poll.isTopicPoll:
                return `${poll.getDetailStateUrl()}`;
            case poll.isMotionPoll:
                // OK
                console.log('IS MOTION POLL', poll.getDetailStateUrl());
                return `/${poll.getDetailStateUrl()}`;
            case poll.isAssignmentPoll:
                console.log('IS ELECTIONS POLL', poll.getDetailStateUrl());
                return `/${poll.getDetailStateUrl()}`;
            case poll.isListPoll:
                console.log('IS LIST POLL', poll.getDetailStateUrl());
                return `/${poll.getDetailStateUrl()}`;
            default:
                return '';
        }
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
     * Returns for a given poll a url for the banner.
     *
     * @param poll The given poll.
     *
     * @returns A string containing the url.
     */
    private getUrlForPoll(poll: ViewPoll): string {
        return this.operator.hasPerms(Permission.meetingCanSeeAutopilot)
            ? `/${this.activeMeeting.meetingId}/polls/`
            : poll.getDetailStateUrl();
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
