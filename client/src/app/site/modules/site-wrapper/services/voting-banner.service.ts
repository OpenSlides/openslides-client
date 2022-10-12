import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { VoteControllerService } from 'src/app/site/pages/meetings/modules/poll/services/vote-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
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

    public constructor(
        pollRepo: PollControllerService,
        private banner: BannerService,
        private translate: TranslateService,
        private historyService: HistoryService,
        private votingService: VotingService,
        private activeMeeting: ActiveMeetingService,
        private sendVotesService: VoteControllerService,
        private operator: OperatorService
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
        await this.sendVotesService.updateHasVotedOnPoll(...polls);
        // display no banner if in history mode or there are no polls to vote
        this.pollsToVote = polls.filter(poll => this.votingService.canVote(poll) && !poll.hasVoted);
        if ((this.historyService.isInHistoryMode() && this.currentBanner) || !this.pollsToVote.length) {
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
        const link = isSinglePoll
            ? this.getUrlForPoll(this.getSinglePoll())
            : `/${this.activeMeeting.meetingId}/polls/`;
        return { text, link };
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
            ? `/${this.activeMeeting.meetingId}/autopilot/`
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
