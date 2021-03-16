import { ChangeDetectorRef, Component, Directive, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Label } from 'ng2-charts';
import { from, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Fqid, Id } from 'app/core/definitions/key-types';
import { Deferred } from 'app/core/promises/deferred';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { PollService } from '../services/poll.service';

export interface BaseVoteData {
    user?: ViewUser;
}

@Component({ template: '' })
export abstract class BasePollDetailComponent extends BaseModelContextComponent implements OnInit {
    /**
     * All the groups of users.
     */
    public userGroups: ViewGroup[] = [];

    /**
     * Details for the iconification of the votes
     */
    public voteOptionStyle = {
        Y: {
            css: 'yes',
            icon: 'thumb_up'
        },
        N: {
            css: 'no',
            icon: 'thumb_down'
        },
        A: {
            css: 'abstain',
            icon: 'trip_origin'
        }
    };

    /**
     * The reference to the poll.
     */
    public poll: ViewPoll = null;

    /**
     * The different labels for the votes (used for chart).
     */
    public labels: Label[] = [];

    // The observable for the votes-per-user table
    public votesDataObservable: Observable<BaseVoteData[]>;

    protected optionsLoaded = new Deferred();

    public voteWeightEnabled: boolean;

    private currentOperator: ViewUser;

    protected get canSeeVotes(): boolean {
        return (this.hasPerms && this.poll.isFinished) || this.poll.isPublished;
    }

    /**
     * Constructor
     *
     * @param title
     * @param translate
     * @param matSnackbar
     * @param repo
     * @param route
     * @param router
     * @param fb
     * @param groupRepo
     * @param location
     * @param promptService
     * @param dialog
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected repo: PollRepositoryService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected groupRepo: GroupRepositoryService,
        protected promptService: PromptService,
        protected pollDialog: BasePollDialogService,
        protected pollService: PollService,
        protected votesRepo: VoteRepositoryService,
        protected operator: OperatorService,
        protected cd: ChangeDetectorRef,
        protected meetingSettingsService: MeetingSettingsService
    ) {
        super(componentServiceCollector);
        this.meetingSettingsService
            .get('users_enable_vote_weight')
            .subscribe(active => (this.voteWeightEnabled = active));
        this.setup();
    }

    /**
     * OnInit-method.
     */
    public ngOnInit(): void {
        this.findComponentById();
    }

    public async deletePoll(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this vote?');
        if (await this.promptService.open(title)) {
            await this.repo.delete(this.poll);
            this.router.navigate([this.poll.getDetailStateURL()]);
        }
    }

    public async pseudoanonymizePoll(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to anonymize all votes? This cannot be undone.');
        if (await this.promptService.open(title)) {
            this.repo.anonymize(this.poll);
        }
    }

    /**
     * Opens dialog for editing the poll
     */
    public openDialog(viewPoll: ViewPoll): void {
        this.pollDialog.openDialog(viewPoll);
    }

    /**
     * This will be false if the operator does not have "can_see_extra_data"
     */
    public userHasVoteDelegation(user: ViewUser): boolean {
        return user.isVoteRightDelegated || this.currentOperator.canVoteFor(user);
    }

    /**
     * This will be false if the operator does not have "can_see_extra_data"
     */
    public getUsersVoteDelegation(user: ViewUser): ViewUser | null {
        if (!!user.vote_delegated_to()) {
            return user.vote_delegated_to();
        }

        if (this.currentOperator.canVoteFor(user)) {
            return this.currentOperator;
        }

        return null;
    }

    protected onStateChanged(): void {}

    protected onAfterSetup(): void {}

    protected abstract hasPerms(): boolean;

    /**
     * Is called when the underlying vote data changes.
     */
    protected abstract createVotesData(): BaseVoteData[];

    /**
     * sets the votes data only if the poll wasn't pseudoanonymized
     */
    protected setVotesData(data: BaseVoteData[]): void {
        if (data.every(voteDate => !voteDate.user)) {
            this.votesDataObservable = null;
        } else {
            this.votesDataObservable = from([data]);
        }
    }

    private async setup(): Promise<void> {
        await this.optionsLoaded;

        this.subscriptions.push(
            this.votesRepo
                .getViewModelListObservable()
                .pipe(
                    // filter first for valid poll state to avoid unneccessary
                    // iteration of potentially thousands of votes
                    filter(() => this.poll && this.canSeeVotes),
                    map(votes => votes.filter(vote => vote.option.poll_id === this.poll.id)),
                    filter(votes => !!votes.length)
                )
                .subscribe(() => {
                    this.setVotesData(this.createVotesData());
                    this.onAfterSetup();
                    this.cd.markForCheck();
                }),
            this.operator.userObservable.subscribe(user => (this.currentOperator = user)),
            this.groupRepo.getViewModelListObservable().subscribe(groups => (this.userGroups = groups))
        );
    }

    private loadComponentById(id: Id): void {
        this.requestModels({
            viewModelCtor: ViewPoll,
            ids: [id],
            follow: [
                {
                    idField: 'content_object_id'
                },
                {
                    idField: 'option_ids',
                    follow: [{ idField: 'vote_ids' }, { idField: 'content_object_id' }]
                },
                {
                    idField: 'global_option_id',
                    follow: [{ idField: 'vote_ids' }]
                }
            ]
        });
    }

    /**
     * Helper-function to search for this poll and display data or create a new one.
     */
    private findComponentById(): void {
        const params = this.route.snapshot.params;
        if (params && params.id) {
            const id = +params.id;
            this.loadComponentById(id);
            this.subscriptions.push(
                this.repo.getViewModelObservable(id).subscribe(poll => {
                    if (poll) {
                        this.poll = poll;
                        this.createVotesData();
                        this.optionsLoaded.resolve();
                        this.cd.markForCheck();
                    }
                })
            );
        }
    }
}
