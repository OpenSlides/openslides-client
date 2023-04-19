import { ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    GlobalVote,
    IdentifiedVotingData,
    PollContentObject,
    PollPropertyVerbose,
    PollType,
    VoteValue,
    VotingData
} from 'src/app/domain/models/poll';
import { BaseComponent } from 'src/app/site/base/base.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { VoteControllerService } from '../../services/vote-controller.service';
import { VotingProhibition, VotingService } from '../../services/voting.service';

export interface VoteOption {
    vote?: VoteValue;
    css?: string;
    icon?: string;
    label: string;
}

export interface PollVoteViewSettings {
    hideLeftoverVotes?: boolean;
    hideGlobalOptions?: boolean;
    hideSendNow?: boolean;
    isSplitSingleOption?: boolean;
}

@Directive()
export abstract class BasePollVoteComponent<C extends PollContentObject = any> extends BaseComponent {
    @Input()
    public set poll(value: ViewPoll<C>) {
        this._poll = value;
        this.updatePoll();
    }

    public get poll(): ViewPoll<C> {
        return this._poll;
    }

    public PollType = PollType;
    public formControlMap: { [optionId: number]: UntypedFormControl } = {};

    public get minVotes(): number {
        return this.poll.min_votes_amount;
    }

    public votingErrors = VotingProhibition;

    public get isReady(): boolean {
        return this._isReady;
    }

    public get isUserPresent(): boolean {
        return this.user?.isPresentInMeeting();
    }

    public PollPropertyVerbose = PollPropertyVerbose;

    public delegations: ViewUser[] = [];

    public readonly voteOptions: VoteOption[] = [
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

    /**
     * Subset of voteOptions that is used based on the pollmethod.
     * If left empty, pollmethod YNA will be assumed
     */
    public voteActions: VoteOption[] = [];

    public get pollHint(): string {
        return null;
    }

    public readonly settings: PollVoteViewSettings = {};

    public readonly noDataLabel: string = _(`No data`);

    public maxVotesPerOptionSuffix: string = _(`votes per option`);

    protected voteRequestData: IdentifiedVotingData = {};

    protected alreadyVoted: { [userId: number]: boolean } = {};

    protected deliveringVote: { [userId: number]: boolean } = {};

    protected user!: ViewUser;

    public voteDelegationEnabled: Observable<boolean> =
        this.meetingSettingsService.get(`users_enable_vote_delegations`);

    private _isReady = false;
    private _poll!: ViewPoll<C>;
    private _delegationsMap: { [userId: number]: ViewUser } = {};
    private _canVoteForSubjectMap: { [userId: number]: BehaviorSubject<boolean> } = {};

    private voteRepo = inject(VoteControllerService);

    public constructor(
        operator: OperatorService,
        protected votingService: VotingService,
        protected cd: ChangeDetectorRef,
        private pollRepo: PollControllerService,
        private meetingSettingsService: MeetingSettingsService,
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            operator.userObservable.pipe(debounceTime(50)).subscribe(user => {
                if (user) {
                    this.user = user;
                    this.delegations = user.vote_delegations_from();
                    this.createVotingDataObjects();

                    for (const key of Object.keys(this._canVoteForSubjectMap)) {
                        this._canVoteForSubjectMap[+key].next(this.canVote(this._delegationsMap[+key]));
                    }

                    this.cd.markForCheck();
                    this._isReady = true;
                }
            })
        );
    }

    public isDeliveringVote(user: ViewUser = this.user): boolean {
        return this.deliveringVote[user?.id];
    }

    public hasAlreadyVoted(user: ViewUser = this.user): boolean {
        return this.alreadyVoted[user?.id];
    }

    public canVoteForObservable(user: ViewUser = this.user): Observable<boolean> {
        if (!this._canVoteForSubjectMap[user.id]) {
            this._canVoteForSubjectMap[user.id] = new BehaviorSubject(this.canVote(user));
        }
        return this._canVoteForSubjectMap[user.id];
    }

    public getVotingError(user: ViewUser = this.user): string {
        return this.votingService.getVotingProhibitionReasonVerbose(this.poll, user) || ``;
    }

    public getVotingErrorFromName(errorName: string) {
        return this.votingService.getVotingProhibitionReasonVerboseFromName(errorName) || ``;
    }

    public getVotesCount(user: ViewUser = this.user): number {
        if (this.voteRequestData[user?.id]) {
            if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && !this.isGlobalOptionSelected(user)) {
                return Object.keys(this.voteRequestData[user.id].value)
                    .map(key => parseInt(this.voteRequestData[user.id].value[+key] as string, 10))
                    .reduce((a, b) => a + b, 0);
            } else {
                return Object.keys(this.voteRequestData[user.id].value).filter(
                    key => this.voteRequestData[user.id].value[+key]
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

    protected isGlobalOptionSelected(user: ViewUser = this.user): boolean {
        const value = this.voteRequestData[user.id]?.value;
        return value === `Y` || value === `N` || value === `A`;
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

    public async submitVote(user: ViewUser, value: any = undefined): Promise<void> {
        this.deliveringVote[user.id] = true;
        this.cd.markForCheck();

        const votePayload = {
            value: value,
            user_id: user.id
        };

        await this.sendVote(user.id, votePayload);
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

    public abstract saveSingleVote(optionId: number, vote: VoteValue, user: ViewUser): void;

    protected async sendVote(userId: Id, votePayload: any): Promise<void> {
        try {
            await this.pollRepo.vote(this.poll, votePayload);
            this.alreadyVoted[userId] = true;
            this.poll.hasVoted = true; // Set it manually to `true`, because the server will do the same
        } catch (e: any) {
            this.raiseError(e);
        } finally {
            this.deliveringVote[userId] = false;
            this.cd.markForCheck();
        }
    }

    protected isErrorInVoteEntry(): boolean {
        for (const key in this.formControlMap) {
            if (this.formControlMap.hasOwnProperty(key) && this.formControlMap[key].invalid) {
                return true;
            }
        }
        return false;
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

    private createVotingDataObjects(): void {
        this.voteRequestData[this.user.id] = { value: {} } as VotingData;
        this.alreadyVoted[this.user.id] = this.poll.hasVoted;
        this.deliveringVote[this.user.id] = false;

        if (this.delegations) {
            this.setupDelegations();
        }
    }

    protected updatePoll(): void {
        this.setupHasVotedSubscription();
    }

    private setupHasVotedSubscription(): void {
        this.subscriptions.push(
            this.voteRepo.subscribeVoted(this.poll).subscribe(() => {
                if (this.user) {
                    this.alreadyVoted[this.user.id] = this.poll.hasVoted;
                    if (this.delegations) {
                        this.setupDelegations();
                    }
                }

                for (const key of Object.keys(this._canVoteForSubjectMap)) {
                    this._canVoteForSubjectMap[+key].next(this.canVote(this._delegationsMap[+key]));
                }
            })
        );
    }

    private setupDelegations(): void {
        for (const delegation of this.delegations) {
            this._delegationsMap[delegation.id] = delegation;
            this.alreadyVoted[delegation.id] = this.poll.hasVotedForDelegations(delegation.id);
            if (!this.voteRequestData[delegation.id]) {
                this.voteRequestData[delegation.id] = { value: {} } as VotingData;
                this.deliveringVote[delegation.id] = false;
            }
        }
    }

    private canVote(user: ViewUser = this.user): boolean {
        return (
            this.votingService.canVote(this.poll, user) &&
            !this.isDeliveringVote(user) &&
            !this.hasAlreadyVoted(user) &&
            this.hasAlreadyVoted(user) !== undefined
        );
    }
}
