import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { VoteControllerService } from 'src/app/site/pages/meetings/modules/poll/services/vote-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';

import { BannerDefinition, BannerService } from './banner.service';
import { SiteWrapperServiceModule } from './site-wrapper-service.module';

@Injectable({
    providedIn: SiteWrapperServiceModule
})
export class VotingBannerService {
    private currentBanner: BannerDefinition;

    private subText = _(`Click here to vote!`);

    public constructor(
        pollRepo: PollControllerService,
        private banner: BannerService,
        private translate: TranslateService,
        private historyService: HistoryService,
        private votingService: VotingService,
        private activeMeeting: ActiveMeetingService,
        private sendVotesService: VoteControllerService
    ) {
        pollRepo
            .getViewModelListObservable()
            .pipe(distinctUntilChanged(), debounceTime(500))
            .subscribe(polls => this.checkForVotablePolls(polls));
    }

    /**
     * checks all polls for votable ones and displays a banner for them
     * @param polls the updated poll list
     */
    private async checkForVotablePolls(polls: ViewPoll[]): Promise<void> {
        // refresh the voting info on all polls. This is a single request to the vote service
        await this.sendVotesService.setHasVotedOnPoll(...polls);
        // display no banner if in history mode or there are no polls to vote
        const pollsToVote = polls.filter(poll => this.votingService.canVote(poll) && !poll.hasVoted);
        if ((this.historyService.isInHistoryMode && this.currentBanner) || !pollsToVote.length) {
            this.sliceBanner();
            return;
        }

        const banner =
            pollsToVote.length === 1
                ? this.createBanner(this.getTextForPoll(pollsToVote[0]), pollsToVote[0].getDetailStateUrl())
                : this.createBanner(
                      `${pollsToVote.length} ${this.translate.instant(`open votes`)}`,
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
            icon: `how_to_vote`,
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
        if (poll.isMotionPoll) {
            const motionTranslation = this.translate.instant(`Motion`);
            const votingOpenedTranslation = this.translate.instant(`Voting opened`);
            return `${motionTranslation} ${contentObject.getNumberOrTitle()}: ${votingOpenedTranslation}`;
        } else if (poll.isAssignmentPoll) {
            return `${contentObject.getTitle()}: ${this.translate.instant(`Ballot opened`)}`;
        } else if (poll.isTopicPoll) {
            return `${contentObject.getTitle()}: ${poll.getTitle()}: ${this.translate.instant(`Voting opened`)}`;
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
