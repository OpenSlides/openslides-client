import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { VotingError, VotingService } from 'app/core/ui-services/voting.service';
import { PollPropertyVerbose, UserVotingData, VoteValue, VotingData } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface VoteOption {
    vote?: VoteValue;
    css?: string;
    icon?: string;
    label?: string;
}

@Directive()
export abstract class BasePollVoteComponent<C extends BaseViewModel = any> extends BaseComponent {
    @Input()
    public set poll(value: ViewPoll<C>) {
        this._poll = value;
        this.setupHasVotedSubscription();
    }

    public get poll(): ViewPoll<C> {
        return this._poll;
    }

    public votingErrors = VotingError;

    public get isReady(): boolean {
        return this._isReady;
    }

    public get isUserPresent(): boolean {
        return this.user?.isPresentInMeeting();
    }

    public PollPropertyVerbose = PollPropertyVerbose;

    protected voteRequestData: UserVotingData = {};

    protected alreadyVoted: { [userId: number]: boolean } = {};

    protected deliveringVote: { [userId: number]: boolean } = {};

    protected user: ViewUser;

    protected delegations: ViewUser[];

    private _isReady = false;
    private _poll: ViewPoll<C>;
    private _delegationsMap: { [userId: number]: ViewUser } = {};
    private _canVoteForSubjectMap: { [userId: number]: BehaviorSubject<boolean> } = {};

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        operator: OperatorService,
        protected votingService: VotingService,
        protected cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            operator.userObservable.pipe(debounceTime(50)).subscribe(user => {
                if (user) {
                    this.user = user;
                    this.delegations = user.vote_delegations_from();
                    this.createVotingDataObjects();
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

    public getVotingError(user: ViewUser = this.user): string | void {
        console.info(`Cannot vote because:`, this.votingService.getVotePermissionErrorVerbose(this.poll, user));
        return this.votingService.getVotePermissionErrorVerbose(this.poll, user);
    }

    private createVotingDataObjects(): void {
        this.voteRequestData[this.user.id] = { value: {} } as VotingData;
        this.alreadyVoted[this.user.id] = this.poll.hasVoted;
        this.deliveringVote[this.user.id] = false;

        if (this.delegations) {
            this.setupDelegations();
        }
    }

    private setupHasVotedSubscription(): void {
        this.subscriptions.push(
            this.poll.hasVotedObservable.subscribe(() => {
                for (const key of Object.keys(this._canVoteForSubjectMap)) {
                    this._canVoteForSubjectMap[key].next(this.canVote(this._delegationsMap[key]));
                }
            })
        );
    }

    private setupDelegations(): void {
        for (const delegation of this.delegations) {
            this._delegationsMap[delegation.id] = delegation;
            if (!this.voteRequestData[delegation.id]) {
                this.voteRequestData[delegation.id] = { value: {} } as VotingData;
                this.alreadyVoted[delegation.id] = this.poll.hasVotedForDelegations(delegation.id);
                this.deliveringVote[delegation.id] = false;
            }
        }
    }

    private canVote(user: ViewUser = this.user): boolean {
        return (
            this.votingService.canVote(this.poll, user) && !this.isDeliveringVote(user) && !this.hasAlreadyVoted(user)
        );
    }
}
