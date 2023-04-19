import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { VoteValue } from 'src/app/domain/models/poll';
import {
    BasePollVoteComponent,
    PollVoteViewSettings,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-vote/base-poll-vote.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewTopic } from '../../../../view-models';

@Component({
    selector: `os-topic-poll-vote`,
    templateUrl: `../../../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.html`,
    styleUrls: [`../../../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicPollVoteComponent extends BasePollVoteComponent<ViewTopic> implements OnInit {
    public override readonly settings: PollVoteViewSettings = {
        hideGlobalOptions: true
    };

    public override readonly noDataLabel = _(`Text for this option couldn't load.`);

    public constructor(
        private promptService: PromptService,
        operator: OperatorService,
        votingService: VotingService,
        cd: ChangeDetectorRef,
        pollRepo: PollControllerService,
        meetingSettingsService: MeetingSettingsService,
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService
    ) {
        super(operator, votingService, cd, pollRepo, meetingSettingsService, componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.defineVoteOptions();
        this.cd.markForCheck();
    }

    public getActionButtonClass(actions: VoteOption, option: ViewOption, user: ViewUser = this.user): string {
        if (
            this.voteRequestData[user?.id]?.value[option.id] === actions.vote ||
            this.voteRequestData[user?.id]?.value[option.id] === 1
        ) {
            return actions.css;
        }
        return ``;
    }

    private defineVoteOptions(): void {
        this.voteActions = [];
        if (this.poll) {
            for (let option of this.voteOptions) {
                if (this.poll.pollmethod.includes(option.vote)) {
                    this.voteActions.push(option);
                }
            }
        }
    }

    public override async submitVote(user: ViewUser = this.user): Promise<void> {
        const value = this.voteRequestData[user.id].value;
        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && this.isErrorInVoteEntry()) {
            this.raiseError(this.translate.instant(`There is an error in your vote.`));
            return;
        }
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await super.submitVote(user, value);
        }
    }

    public saveSingleVote(optionId: number, vote: VoteValue, user: ViewUser = this.user): void {
        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            delete this.voteRequestData[user.id].value;
        }

        if (this.poll.isMethodY || this.poll.isMethodN) {
            this.saveSingleVoteMethodYOrN(optionId, vote, user);
        } else {
            // YN/YNA
            this.saveSingleVoteMethodYNOrYNA(optionId, vote, user);
        }
    }

    public saveSingleVoteMethodYNOrYNA(optionId: number, vote: VoteValue, user: ViewUser = this.user): void {
        if (this.voteRequestData[user.id].value[optionId] && this.voteRequestData[user.id].value[optionId] === vote) {
            delete (this.voteRequestData[user.id] as any).value[optionId];
        } else {
            (this.voteRequestData[user.id] as any).value[optionId] = vote;
        }

        // if a user filled out every option, try to send
        if (Object.keys(this.voteRequestData[user.id].value).length === this.poll.options.length) {
            this.submitVote(user);
        }
    }

    public saveSingleVoteMethodYOrN(optionId: number, vote: VoteValue, user: ViewUser = this.user): void {
        const maxVotesAmount = this.poll.max_votes_amount;
        const tmpVoteRequest = this.getTMPVoteRequestYOrN(maxVotesAmount, optionId, user);

        this.handleVotingMethodYOrN(maxVotesAmount, tmpVoteRequest, user);
    }

    public handleVotingMethodYOrN(maxVotesAmount: number, tmpVoteRequest: {}, user: ViewUser = this.user) {
        // check if you can still vote
        const countedVotes = Object.keys(tmpVoteRequest).filter(key => tmpVoteRequest[key]).length;
        if (countedVotes <= maxVotesAmount) {
            this.voteRequestData[user.id].value = tmpVoteRequest;

            // if you have no options anymore, try to send
            if (this.getVotesCount(user) === maxVotesAmount) {
                this.submitVote(user);
            }
        } else {
            this.raiseError(
                this.translate.instant(`You reached the maximum amount of votes. Deselect somebody first.`)
            );
        }
    }

    private getTMPVoteRequestYOrN(maxVotesAmount: number, optionId: number, user: ViewUser = this.user): {} {
        return this.poll.options
            .map(option => option.id)
            .reduce((o, n) => {
                o[n] = 0;
                if (maxVotesAmount === 1) {
                    if (n === optionId && this.voteRequestData[user.id].value[n] !== 1) {
                        o[n] = 1;
                    }
                } else if ((n === optionId) !== (this.voteRequestData[user.id].value[n] === 1)) {
                    o[n] = 1;
                }

                return o;
            }, {});
    }

    protected override updatePoll() {
        super.updatePoll();
        this.defineVoteOptions();
    }
}
