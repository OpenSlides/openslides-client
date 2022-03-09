import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PollAction } from 'app/core/actions/poll-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { VotingService } from 'app/core/ui-services/voting.service';
import { GlobalVote, PollMethod, PollType, VoteValue } from 'app/shared/models/poll/poll-constants';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BasePollVoteComponent, VoteOption } from 'app/site/polls/components/base-poll-vote.component';
import { ViewUser } from 'app/site/users/models/view-user';

import { UnknownUserLabel } from '../../services/assignment-poll.service';

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
    selector: `os-assignment-poll-vote`,
    templateUrl: `./assignment-poll-vote.component.html`,
    styleUrls: [`./assignment-poll-vote.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentPollVoteComponent extends BasePollVoteComponent<ViewAssignment> implements OnInit {
    public unknownUserLabel = UnknownUserLabel;
    public AssignmentPollMethod = PollMethod;
    public PollType = PollType;
    public voteActions: VoteOption[] = [];
    public formControls: { [optionId: number]: FormControl} = {};

    public get pollHint(): string {
        return this.poll.content_object.default_poll_description;
    }

    public get minVotes(): number {
        return this.poll.min_votes_amount;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        operator: OperatorService,
        votingService: VotingService,
        pollRepo: PollRepositoryService,
        private promptService: PromptService,
        protected cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate, operator, votingService, cd, pollRepo);
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

    public getFormControl(optionId: number): FormControl{
        if (this.formControls[optionId]){

        } else {
            this.formControls[optionId] = new FormControl(0,
                [Validators.required,
                Validators.min(0),
                Validators.max(this.poll.max_votes_per_option)]
            );
        }
        return this.formControls[optionId];
    }

    public isErrorInVoteEntry(): boolean{
        for (const key in this.formControls){
            if (this.formControls.hasOwnProperty(key)){
                if (this.formControls[key].invalid){
                    return true;
                }
            }
        }
        return false;
    }

    public getErrorInVoteEntry(optionId: number): String {
        if (this.formControls[optionId].hasError(`required`)){
            return this.translate.instant(`This is not a number.`);
        } else if (this.formControls[optionId].hasError(`min`)){
            return this.translate.instant(`Negative votes are not allowed.`);
        } else if (this.formControls[optionId].hasError(`max`)){
            return this.translate.instant(`Too many votes on one option.`);
        }
        return ``;
    }

    public getVotesCount(user: ViewUser = this.user): number {
        if (this.voteRequestData[user?.id]) {
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && !this.isGlobalOptionSelected(user)){
                return Object.keys(this.voteRequestData[user.id].value).map(
                    key => parseInt(this.voteRequestData[user.id].value[key], 10)).reduce((a,b) => (a+b),0);
            } else {
                return Object.keys(this.voteRequestData[user.id].value).filter(
                    key => this.voteRequestData[user.id].value[key]
                ).length;
            }
        }
    }

    public getVotesAvailable(user: ViewUser = this.user): number | String {
        if (this.isGlobalOptionSelected()){
            return `-`;
        }
        return this.poll.max_votes_amount - this.getVotesCount(user);
    }

    private isGlobalOptionSelected(user: ViewUser = this.user): boolean {
        const value = this.voteRequestData[user.id]?.value;
        return value === `Y` || value === `N` || value === `A`;
    }

    public async submitVote(user: ViewUser = this.user): Promise<void> {
        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1
                && this.isErrorInVoteEntry()){
            this.raiseError(
                    this.translate.instant(`There is an error in your vote.`)
                );
            return;
        }
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            this.deliveringVote[user.id] = true;
            this.cd.markForCheck();

            const votePayload: PollAction.YNVotePayload | PollAction.YNAVotePayload = {
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
            const maxVotesAmount = this.poll.max_votes_amount;
            const tmpVoteRequest = this.poll.options
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

            // if a user filled out every option, try to send
            if (Object.keys(this.voteRequestData[user.id].value).length === this.poll.options.length) {
                this.submitVote(user);
            }
        }
    }

    public saveMultipleVote(optionId: number, event: any, user: ViewUser = this.user): void {
        let vote = parseInt(event.target.value, 10);

        if (isNaN(vote) || vote > this.poll.max_votes_per_option || vote < 0){
            vote = 0;
        }

        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            delete this.voteRequestData[user.id].value;
        }

        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1) {
            // Another option is not expected here
            const maxVotesAmount = this.poll.max_votes_amount;
            const maxVotesAmountPP = this.poll.max_votes_per_option;
            const tmpVoteRequest = this.poll.options
                .map(option => option.id)
                .reduce((o, n) => {
                    o[n] = this.voteRequestData[user.id].value[n];
                    o[n] = o[n] ? o[n] : 0;
                    if (n === optionId){
                        if (vote > Math.min(maxVotesAmountPP, maxVotesAmount)) {
                            o[n] = Math.min(maxVotesAmountPP, maxVotesAmount);
                        } else if (vote >= 0){
                            o[n] = vote;
                        }
                    }
                    return o;
                }, {});

            // check if you can still vote
            const countedVotes = Object.keys(tmpVoteRequest).map(key => parseInt(tmpVoteRequest[key], 10)).reduce((a,b) => (a+b),0);
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
                this.formControls[optionId].setValue(this.voteRequestData[user.id].value[optionId]);
            }
        }
    }

    public saveGlobalVote(globalVote: GlobalVote, user: ViewUser = this.user): void {
        if (this.voteRequestData[user.id].value && this.voteRequestData[user.id].value === globalVote) {
            this.voteRequestData[user.id].value = {};
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1){
                for (const key in this.formControls){
                    if (this.formControls.hasOwnProperty(key)){
                        this.formControls[key].enable();
                    }
                }
            }

        } else {
            this.voteRequestData[user.id].value = globalVote;
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1){
                for (const key in this.formControls){
                    if (this.formControls.hasOwnProperty(key)){
                        this.formControls[key].setValue(0);
                        this.formControls[key].disable();
                    }
                }
            }
            this.submitVote(user);
        }
    }
}
