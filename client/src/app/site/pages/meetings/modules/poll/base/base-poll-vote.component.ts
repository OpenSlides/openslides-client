import { ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    IdentifiedVotingData,
    PollContentObject,
    PollPropertyVerbose,
    VoteValue,
    VotingData
} from 'src/app/domain/models/poll';
import { BaseComponent } from 'src/app/site/base/base.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { VoteControllerService } from '../services/vote-controller.service';
import { VotingProhibition, VotingService } from '../services/voting.service';

export interface VoteOption {
    vote?: VoteValue;
    css?: string;
    icon?: string;
    label: string;
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

    public votingErrors = VotingProhibition;

    public get isReady(): boolean {
        return this._isReady;
    }

    public get isUserPresent(): boolean {
        return this.user?.isPresentInMeeting();
    }

    public PollPropertyVerbose = PollPropertyVerbose;

    public delegations: ViewUser[] = [];

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
        super();
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
