import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVote, PollMethod, PollType, VoteValue } from 'src/app/domain/models/poll';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-vote.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewTopic } from '../../../../view-models';

const voteOptions = {
    Yes: {
        vote: `Y`,
        css: `voted-yes`,
        icon: `thumb_up`,
        label: `Yes`
    } as VoteOption,
    No: {
        vote: `N`,
        css: `voted-no`,
        icon: `thumb_down`,
        label: `No`
    } as VoteOption,
    Abstain: {
        vote: `A`,
        css: `voted-abstain`,
        icon: `trip_origin`,
        label: `Abstain`
    } as VoteOption
};

@Component({
    selector: `os-topic-poll-vote`,
    templateUrl: `./topic-poll-vote.component.html`,
    styleUrls: [`./topic-poll-vote.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicPollVoteComponent extends BasePollVoteComponent<ViewTopic> implements OnInit {
    public TopicPollMethod = PollMethod;
    public PollType = PollType;
    public voteActions: VoteOption[] = [];
    public formControlMap: { [optionId: number]: UntypedFormControl } = {};

    public get minVotes(): number {
        return this.poll.min_votes_amount;
    }

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

    public getGlobalYesClass(user: ViewUser = this.user): string {
        if (this.voteRequestData[user.id]?.value === `Y`) {
            return `voted-yes`;
        }
        return ``;
    }

    public getGlobalAbstainClass(user: ViewUser = this.user): string {
        if (this.voteRequestData[user.id]?.value === `A`) {
            return `voted-abstain`;
        }
        return ``;
    }

    public getGlobalNoClass(user?: ViewUser): string {
        if (!user) {
            if (!this.user) {
                return ``;
            }
            user = this.user;
        }
        if (this.voteRequestData[user.id]?.value === `N`) {
            return `voted-no`;
        }
        return ``;
    }

    private defineVoteOptions(): void {
        this.voteActions = [];
        if (this.poll) {
            if (this.poll.isMethodN) {
                this.voteActions.push(voteOptions.No);
            } else {
                this.voteActions.push(voteOptions.Yes);

                if (!this.poll.isMethodY) {
                    this.voteActions.push(voteOptions.No);
                }

                if (this.poll.isMethodYNA) {
                    this.voteActions.push(voteOptions.Abstain);
                }
            }
        }
    }

    public getFormControl(optionId: number): UntypedFormControl {
        if (!this.formControlMap[optionId]) {
            this.formControlMap[optionId] = new UntypedFormControl(0, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.poll.max_votes_per_option)
            ]);
        }
        return this.formControlMap[optionId];
    }

    public isErrorInVoteEntry(): boolean {
        for (const key in this.formControlMap) {
            if (this.formControlMap.hasOwnProperty(key) && this.formControlMap[key].invalid) {
                return true;
            }
        }
        return false;
    }

    public getErrorInVoteEntry(optionId: number): string {
        if (this.formControlMap[optionId].hasError(`required`)) {
            return this.translate.instant(`This is not a number.`);
        } else if (this.formControlMap[optionId].hasError(`min`)) {
            return this.translate.instant(`Negative votes are not allowed.`);
        } else if (this.formControlMap[optionId].hasError(`max`)) {
            return this.translate.instant(`Too many votes on one option.`);
        }
        return ``;
    }

    public getVotesCount(user: ViewUser = this.user): number {
        if (this.voteRequestData[user?.id]) {
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && !this.isGlobalOptionSelected(user)) {
                return Object.keys(this.voteRequestData[user.id].value)
                    .map(key => parseInt(this.voteRequestData[user.id].value[key], 10))
                    .reduce((a, b) => a + b, 0);
            } else {
                return Object.keys(this.voteRequestData[user.id].value).filter(
                    key => this.voteRequestData[user.id].value[key]
                ).length;
            }
        }
        return 0;
    }

    public getVotesAvailable(user: ViewUser = this.user): number | string {
        if (this.isGlobalOptionSelected()) {
            return `-`;
        }
        return this.poll.max_votes_amount - this.getVotesCount(user);
    }

    private isGlobalOptionSelected(user: ViewUser = this.user): boolean {
        const value = this.voteRequestData[user.id]?.value;
        return value === `Y` || value === `N` || value === `A`;
    }

    public async submitVote(user: ViewUser = this.user): Promise<void> {
        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && this.isErrorInVoteEntry()) {
            this.raiseError(this.translate.instant(`There is an error in your vote.`));
            return;
        }
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            this.deliveringVote[user.id] = true;
            this.cd.markForCheck();

            const votePayload = {
                value: this.voteRequestData[user.id].value,
                user_id: user.id
            };

            await this.sendVote(user.id, votePayload);
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

    public saveMultipleVotes(optionId: number, event: any, user: ViewUser = this.user): void {
        let vote = parseInt(event.target.value, 10);

        if (isNaN(vote) || vote > this.poll.max_votes_per_option || vote < 0) {
            vote = 0;
        }

        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            delete this.voteRequestData[user.id].value;
        }

        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1) {
            this.saveMultipleVotesMultiVoteMethodY(optionId, vote, user);
        }
    }

    private saveMultipleVotesMultiVoteMethodY(optionId: number, vote: number, user: ViewUser = this.user): void {
        // Another option is not expected here
        const maxVotesAmount = this.poll.max_votes_amount;
        const tmpVoteRequest = this.getTmpVoteRequestMultipleVotes(optionId, vote, user);

        // check if you can still vote
        const countedVotes = Object.keys(tmpVoteRequest)
            .map(key => parseInt(tmpVoteRequest[key], 10))
            .reduce((a, b) => a + b, 0);
        if (countedVotes <= maxVotesAmount) {
            this.voteRequestData[user.id].value = tmpVoteRequest;

            // if you have no options anymore, try to send
            if (this.getVotesCount(user) === maxVotesAmount && !this.isErrorInVoteEntry()) {
                this.submitVote(user);
            }
        } else {
            this.raiseError(
                this.translate.instant(`You reached the maximum amount of votes. Deselect one option first.`)
            );
            this.formControlMap[optionId].setValue(this.voteRequestData[user.id].value[optionId]);
        }
    }

    private getTmpVoteRequestMultipleVotes(
        optionId: number,
        vote: number,
        user: ViewUser = this.user
    ): { [option_id: number]: number } {
        const maxVotesAmount = this.poll.max_votes_amount;
        const maxVotesPerOption = this.poll.max_votes_per_option;
        return this.poll.options
            .map(option => option.id)
            .reduce((output, next_id) => {
                output[next_id] = this.voteRequestData[user.id].value[next_id];
                output[next_id] = output[next_id] ? output[next_id] : 0;
                if (next_id === optionId) {
                    if (vote > Math.min(maxVotesPerOption, maxVotesAmount)) {
                        output[next_id] = Math.min(maxVotesPerOption, maxVotesAmount);
                    } else if (vote >= 0) {
                        output[next_id] = vote;
                    }
                }
                return output;
            }, {});
    }

    public saveGlobalVote(globalVote: GlobalVote, user: ViewUser = this.user): void {
        if (this.voteRequestData[user.id].value && this.voteRequestData[user.id].value === globalVote) {
            this.voteRequestData[user.id].value = {};
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1) {
                this.enableInputs();
            }
        } else {
            this.voteRequestData[user.id].value = globalVote;
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1) {
                this.disableAndResetInputs();
            }
            this.submitVote(user);
        }
    }

    protected override updatePoll() {
        super.updatePoll();
        this.defineVoteOptions();
    }

    private enableInputs(): void {
        for (const key in this.formControlMap) {
            if (this.formControlMap.hasOwnProperty(key)) {
                this.formControlMap[key].enable();
            }
        }
    }

    private disableAndResetInputs(): void {
        for (const key in this.formControlMap) {
            if (this.formControlMap.hasOwnProperty(key)) {
                this.formControlMap[key].setValue(0);
                this.formControlMap[key].disable();
            }
        }
    }
}
