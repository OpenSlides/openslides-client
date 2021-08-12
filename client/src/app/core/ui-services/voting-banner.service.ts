import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { BannerDefinition, BannerService } from './banner.service';
import { HistoryService } from '../core-services/history.service';
import { PollRepositoryService } from '../repositories/polls/poll-repository.service';
import { VotingService } from './voting.service';

@Injectable({
    providedIn: 'root'
})
export class VotingBannerService {
    private currentBanner: BannerDefinition;

    private subText = _('Click here to vote!');

    public constructor(
        pollRepo: PollRepositoryService,
        private banner: BannerService,
        private translate: TranslateService,
        private historyService: HistoryService,
        private votingService: VotingService,
        private activeMeeting: ActiveMeetingService
    ) {
        pollRepo.getViewModelListObservable().subscribe(polls => this.checkForVotablePolls(polls));
    }

    /**
     * checks all polls for votable ones and displays a banner for them
     * @param polls the updated poll list
     */
    private checkForVotablePolls(polls: ViewPoll[]): void {
        // display no banner if in history mode or there are no polls to vote
        const pollsToVote = polls.filter(poll => this.votingService.canVote(poll) && !poll.operatorHasVoted());
        if ((this.historyService.isInHistoryMode && this.currentBanner) || !pollsToVote.length) {
            this.sliceBanner();
            return;
        }

        const banner =
            pollsToVote.length === 1
                ? this.createBanner(this.getTextForPoll(pollsToVote[0]), pollsToVote[0].getDetailStateURL())
                : this.createBanner(
                      `${pollsToVote.length} ${this.translate.instant('open votes')}`,
                      `/${this.activeMeeting.meetingId}/polls/`
                  );
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
            icon: 'how_to_vote',
            largerOnMobileView: true
        };
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
        if (contentObject instanceof ViewMotion) {
            const motionTranslation = this.translate.instant('Motion');
            const votingOpenedTranslation = this.translate.instant('Voting opened');
            return `${motionTranslation} ${contentObject.getNumberOrTitle()}: ${votingOpenedTranslation}`;
        } else if (contentObject instanceof ViewAssignment) {
            return `${contentObject.getTitle()}: ${this.translate.instant('Ballot opened')}`;
        } else {
            return this.translate.instant('Voting opened');
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
