import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-vote.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-motion-poll-vote`,
    templateUrl: `./motion-poll-vote.component.html`,
    styleUrls: [`./motion-poll-vote.component.scss`]
})
export class MotionPollVoteComponent extends BasePollVoteComponent implements OnInit {
    public voteOptions: VoteOption[] = [
        {
            vote: `Y`,
            css: `voted-yes`,
            icon: `thumb_up`,
            label: `Yes`
        },
        {
            vote: `N`,
            css: `voted-no`,
            icon: `thumb_down`,
            label: `No`
        },
        {
            vote: `A`,
            css: `voted-abstain`,
            icon: `trip_origin`,
            label: `Abstain`
        }
    ];

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
        this.cd.markForCheck();
    }

    public getActionButtonClass(voteOption: VoteOption, id: number, user: ViewUser = this.user): string {
        if (
            this.voteRequestData[user?.id]?.value[id] === voteOption.vote ||
            this.voteRequestData[user?.id]?.value[id] === 1
        ) {
            return voteOption.css!;
        }
        return ``;
    }

    public get minVotes(): number {
        return this.poll.min_votes_amount;
    }

    public saveVote(optionId: Id, vote: VoteValue, user: ViewUser = this.user): void {
        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            this.voteRequestData[user.id].value = {};
        }

        if (this.poll.isMethodY || this.poll.isMethodN) {
            const maxVotesAmount = this.poll.max_votes_amount;
            const tmpVoteRequest = this.poll.options
                .map(option => option.id)
                .reduce((o: any, n) => {
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

            // check if you can still vote
            const countedVotes = Object.keys(tmpVoteRequest).filter(key => tmpVoteRequest[key]).length;
            if (countedVotes <= maxVotesAmount) {
                this.voteRequestData[user.id].value = tmpVoteRequest;
            } else {
                this.raiseError(
                    this.translate.instant(`You reached the maximum amount of votes. Deselect somebody first.`)
                );
            }
        } else {
            // YN/YNA
            if (
                this.voteRequestData[user.id].value[optionId] &&
                this.voteRequestData[user.id].value[optionId] === vote
            ) {
                delete (this.voteRequestData[user.id] as any).value[optionId];
            } else {
                (this.voteRequestData[user.id] as any).value[optionId] = vote;
            }
        }
    }

    public async submitVote(user: ViewUser = this.user): Promise<void> {
        if (!this.voteRequestData[user?.id]) {
            return;
        }

        const value = this.voteRequestData[user.id].value;
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            this.deliveringVote[user.id] = true;
            this.cd.markForCheck();

            const votePayload = {
                value: value,
                user_id: user.id
            };
            await this.sendVote(user.id, votePayload);
        }
    }

    public async submitVotes(users: ViewUser[]): Promise<void> {
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decisions cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);
        let value = this.voteRequestData[this.user.id].value;
        if (confirmed) {
            if (!this.hasAlreadyVoted() && !(this.getVotingError() === `You do not have the permission to vote.`)) {
                this.deliveringVote[this.user.id] = true;
                this.cd.markForCheck();

                const votePayload = {
                    value: value,
                    user_id: this.user.id
                };
                await this.sendVote(this.user.id, votePayload);
            }
            for (let user of users) {
                const value = this.voteRequestData[user.id].value;
                if (
                    !this.hasAlreadyVoted(user) &&
                    !(this.getVotingError(user) === `You do not have the permission to vote.`)
                ) {
                    this.deliveringVote[user.id] = true;
                    this.cd.markForCheck();

                    const votePayload = {
                        value: value,
                        user_id: user.id
                    };

                    await this.sendVote(user.id, votePayload);
                }
            }
        }
    }

    protected compareMinAllVotes(delegations: ViewUser[]): boolean {
        let reachedMinValue = false;
        const minVote = 1;
        if (!(this.getVotingError() === `You do not have the permission to vote.`)) {
            if (!this.hasAlreadyVoted()) {
                if (this.getVotesCount() < minVote) {
                    reachedMinValue = true;
                }
            }
        }
        for (let delegation of delegations) {
            if (!(this.getVotingError(delegation) === `You do not have the permission to vote.`)) {
                if (!this.hasAlreadyVoted(delegation)) {
                    if (this.getVotesCount(delegation) < minVote) {
                        reachedMinValue = true;
                    }
                }
            }
        }
        return reachedMinValue;
    }

    public getVotesCount(user: ViewUser = this.user): number {
        if (this.voteRequestData[user?.id]) {
            return Object.keys(this.voteRequestData[user.id].value).filter(
                key => this.voteRequestData[user.id].value[+key]
            ).length;
        }
        return 0;
    }

    private isGlobalOptionSelected(user: ViewUser = this.user): boolean {
        const value = this.voteRequestData[user.id]?.value;
        return value === `Y` || value === `N` || value === `A`;
    }
}
