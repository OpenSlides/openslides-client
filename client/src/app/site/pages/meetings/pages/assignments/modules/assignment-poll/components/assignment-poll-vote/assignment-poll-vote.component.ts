import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVote, PollMethod, PollType } from 'src/app/domain/models/poll/poll-constants';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-vote.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { UnknownUserLabel } from '../../services/assignment-poll.service';

const voteOptions: {
    Yes: VoteOption;
    No: VoteOption;
    Abstain: VoteOption;
} = {
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
    selector: `os-assignment-poll-vote`,
    templateUrl: `./assignment-poll-vote.component.html`,
    styleUrls: [`./assignment-poll-vote.component.scss`]
})
export class AssignmentPollVoteComponent extends BasePollVoteComponent<ViewAssignment> implements OnInit {
    public unknownUserLabel = UnknownUserLabel;
    public AssignmentPollMethod = PollMethod;
    public PollType = PollType;
    public voteActions: VoteOption[] = [];
    public formControlMap: { [optionId: number]: UntypedFormControl } = {};

    public get pollHint(): string | null {
        if (this.poll?.content_object) {
            return this.poll.content_object!.default_poll_description;
        }
        return null;
    }

    public get minVotes(): number {
        return this.poll.min_votes_amount;
    }

    private get assignment(): ViewAssignment {
        return this.poll.content_object;
    }

    public get enumerateCandidates(): boolean {
        return this.assignment?.number_poll_candidates || false;
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
            return actions.css!;
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

    public getVotesAvailable(user: ViewUser = this.user): number | string {
        if (this.isGlobalOptionSelected()) {
            return `-`;
        }
        return this.poll.max_votes_amount - this.getVotesCount(user);
    }

    public async submitVote(user: ViewUser = this.user): Promise<void> {
        const value = this.voteRequestData[user.id].value;
        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && this.isErrorInVoteEntry()) {
            this.raiseError(this.translate.instant(`There is an error in your vote.`));
            return;
        }
        const title = this.translate.instant(`Submit selection now?`);
        let content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        if (this.poll.max_votes_amount > 1 && !this.isGlobalOptionSelected()) {
            content =
                this.translate.instant(`Your votes`) +
                `: ${this.getVotesCount()}/${this.poll.max_votes_amount}<br>` +
                content;
        }
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

    public async submitVotes(): Promise<void> {
        let { maxVotesAmount, pollMaximum } = this.countMaxVotesAndPoll();

        const title = this.translate.instant(`Submit selection now?`);
        const content =
            this.translate.instant(`Your votes`) +
            `: ${maxVotesAmount}/${pollMaximum}<br>` +
            this.translate.instant(`Your decision cannot be changed afterwards.`);

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            for (let delegation of this.delegations.concat(this.user)) {
                if (this.getVotingError() === `` && !this.isDeliveringVote[delegation.id]) {
                    this.preparePayload(delegation);
                }
            }
        }
    }

    public countMaxVotesAndPoll(): { maxVotesAmount: number; pollMaximum: number } {
        let maxVotesAmount = 0;
        let pollMaximum = 0;
        let isListOpt = false;
        let countableDelegations = 0;

        if (this.getVotingError() === ``) {
            maxVotesAmount = this.getVotesCount();
            pollMaximum = this.poll.max_votes_amount;
        }
        for (let delegation of this.delegations) {
            if (this.getVotingError(delegation) === ``) {
                if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && this.isErrorInVoteEntry()) {
                    this.raiseError(this.translate.instant(`There is an error in your vote.`));
                    break;
                }
                maxVotesAmount += this.getVotesCount(delegation);
                pollMaximum += this.poll.max_votes_amount;
                countableDelegations += 1;
            }
        }
        for (let option of this.poll.options) {
            if (option.isListOption) {
                isListOpt = true;
            }
        }
        if ((this.poll.isMethodYNA && !isListOpt) || this.poll.isMethodYN) {
            pollMaximum *= countableDelegations;
        }
        return { maxVotesAmount, pollMaximum };
    }

    public saveSingleVote(optionId: number, vote?: VoteValue, user: ViewUser = this.user): void {
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

    public saveMultipleVotes(optionId: number, event: any, user: ViewUser = this.user): void {
        let vote = parseInt(event.target.value, 10);

        if (isNaN(vote) || vote > this.poll.max_votes_per_option || vote < 0) {
            vote = 0;
        }

        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            this.voteRequestData[user.id].value = {};
        }

        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1) {
            // Another option is not expected here
            const maxVotesAmount = this.poll.max_votes_amount;
            const tmpVoteRequest = this.getTmpVoteRequestMultipleVotes(optionId, vote, user);

            // check if you can still vote
            const countedVotes = Object.keys(tmpVoteRequest)
                .map(key => tmpVoteRequest[+key])
                .reduce((a, b) => a + b, 0);
            if (countedVotes <= maxVotesAmount) {
                this.voteRequestData[user.id].value = tmpVoteRequest;

                // if you have no options anymore, try to send
                if (this.getVotesCount(user) === maxVotesAmount && !this.isErrorInVoteEntry()) {
                    this.submitVote(user);
                }
            } else {
                this.raiseError(
                    this.translate.instant(`You reached the maximum amount of votes. Deselect somebody first.`)
                );
                this.formControlMap[optionId].setValue(this.voteRequestData[user.id].value[optionId]);
            }
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
            .reduce((output: any, next_id) => {
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
