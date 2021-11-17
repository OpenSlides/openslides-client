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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface VoteOption {
    vote?: VoteValue;
    css?: string;
    icon?: string;
    label?: string;
}

@Directive()
export abstract class BasePollVoteComponent<C extends BaseViewModel = any> extends BaseComponent {
    @Input()
    public poll: ViewPoll<C>;

    public votingErrors = VotingError;

    protected voteRequestData: UserVotingData = {};

    protected alreadyVoted = {};

    protected deliveringVote = {};

    protected user: ViewUser;

    protected delegations: ViewUser[];

    public PollPropertyVerbose = PollPropertyVerbose;

    public get isUserPresent(): boolean {
        return this.user.isPresentInMeeting();
    }

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
                }
            })
        );
    }

    protected createVotingDataObjects(): void {
        if (this.user) {
            this.voteRequestData[this.user.id] = {
                value: {}
            } as VotingData;
            this.alreadyVoted[this.user.id] = this.poll.hasVoted;
            this.deliveringVote[this.user.id] = false;
        }

        if (this.delegations) {
            for (const delegation of this.delegations) {
                if (!this.voteRequestData[delegation.id]) {
                    this.voteRequestData[delegation.id] = {
                        value: {}
                    } as VotingData;
                    this.alreadyVoted[delegation.id] = this.poll.hasVotedForDelegations(delegation.id);
                    this.deliveringVote[delegation.id] = false;
                }
            }
        }
    }

    public isDeliveringVote(user: ViewUser = this.user): boolean {
        return this.deliveringVote[user.id] === true;
    }

    public hasAlreadyVoted(user: ViewUser = this.user): boolean {
        return this.alreadyVoted[user.id] === true;
    }

    public canVote(user: ViewUser = this.user): boolean {
        return (
            this.votingService.canVote(this.poll, user) && !this.isDeliveringVote(user) && !this.hasAlreadyVoted(user)
        );
    }

    public getVotingError(user: ViewUser = this.user): string | void {
        console.info(`Cannot vote because:`, this.votingService.getVotePermissionErrorVerbose(this.poll, user));
        return this.votingService.getVotePermissionErrorVerbose(this.poll, user);
    }
}
