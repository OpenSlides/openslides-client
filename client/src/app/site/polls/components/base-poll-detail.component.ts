import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { Deferred } from 'app/core/promises/deferred';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { Label } from 'ng2-charts';
import { from, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PollService } from '../services/poll.service';
import { EntitledUsersTableEntry } from './entitled-users-table/entitled-users-table.component';

export interface BaseVoteData {
    user?: ViewUser;
}

@Directive()
export abstract class BasePollDetailComponentDirective<V extends ViewPoll<BaseViewModel>, S extends PollService>
    extends BaseModelContextComponent
    implements OnInit, OnDestroy
{
    /**
     * All the groups of users.
     */
    public userGroups: ViewGroup[] = [];

    /**
     * Holding all groups.
     */
    public groupObservable: Observable<ViewGroup[]> = null;

    /**
     * Details for the iconification of the votes
     */
    public voteOptionStyle = {
        Y: {
            css: `yes`,
            icon: `thumb_up`
        },
        N: {
            css: `no`,
            icon: `thumb_down`
        },
        A: {
            css: `abstain`,
            icon: `trip_origin`
        }
    };

    /**
     * The reference to the poll.
     */
    public poll: V = null;

    /**
     * The different labels for the votes (used for chart).
     */
    public labels: Label[] = [];

    // The observable for the votes-per-user table
    public votesDataObservable: Observable<BaseVoteData[]>;

    // The observable for the entitled-users-table
    public entitledUsersObservable: Observable<EntitledUsersTableEntry[]>;

    protected optionsLoaded = new Deferred();

    private entitledUsersSubscription: Subscription;

    public voteWeightEnabled: Observable<boolean> = this.meetingSettingsService.get(`users_enable_vote_weight`);

    private currentOperator: ViewUser;

    protected get canSeeVotes(): boolean {
        return (this.hasPerms && this.poll.isFinished) || this.poll.isPublished;
    }

    protected get contentObjectId(): Id {
        return this.poll?.getContentObject().id;
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
        protected translate: TranslateService,
        protected repo: PollRepositoryService,
        protected route: ActivatedRoute,
        protected groupRepo: GroupRepositoryService,
        protected promptService: PromptService,
        protected pollDialog: BasePollDialogService,
        protected pollService: S,
        protected votesRepo: VoteRepositoryService,
        protected operator: OperatorService,
        protected cd: ChangeDetectorRef,
        protected meetingSettingsService: MeetingSettingsService,
        protected userRepo: UserRepositoryService
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            this.operator.userObservable.subscribe(currentUser => {
                this.currentOperator = currentUser;
            })
        );
    }

    /**
     * OnInit-method.
     */
    public ngOnInit(): void {
        this.findComponentById();

        this.groupObservable = this.groupRepo.getViewModelListObservable();
        this.subscriptions.push(
            this.groupRepo.getViewModelListObservable().subscribe(groups => (this.userGroups = groups))
        );
    }

    public async deletePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this vote?`);
        if (await this.promptService.open(title)) {
            this.repo.delete(this.poll).then(() => this.onDeleted(), this.raiseError);
        }
    }

    public async pseudoanonymizePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to anonymize all votes? This cannot be undone.`);
        if (await this.promptService.open(title)) {
            this.repo.anonymize(this.poll).catch(this.raiseError);
        }
    }

    /**
     * Opens dialog for editing the poll
     */
    public openDialog(viewPoll: V): void {
        this.pollDialog.openDialog(viewPoll);
    }

    protected onStateChanged(): void {}

    protected abstract hasPerms(): boolean;

    protected abstract onDeleted(): void;

    /**
     * Set the votes data.
     */
    protected setVotesData(data: BaseVoteData[]): void {
        this.votesDataObservable = from([data]);
    }

    /**
     * Is called when the underlying vote data changes. Is supposed to call setVotesData
     */
    protected abstract createVotesData(): void;

    private loadComponentById(id: Id): void {
        this.requestModels({
            viewModelCtor: ViewPoll,
            ids: [id],
            follow: [
                {
                    idField: `content_object_id`
                },
                {
                    idField: `voted_ids`,
                    fieldset: `singleVotes`
                },
                {
                    idField: `option_ids`,
                    follow: [{ idField: `vote_ids` }, { idField: `content_object_id` }]
                },
                {
                    idField: `global_option_id`,
                    follow: [{ idField: `vote_ids` }]
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
                this.repo.getViewModelObservable(id).subscribe((poll: V) => {
                    if (poll) {
                        this.poll = poll;
                        this.createVotesData();
                        this.setEntitledUsersData();
                    }
                })
            );
        }
    }

    private setEntitledUsersData(): void {
        if (this.entitledUsersSubscription) {
            this.entitledUsersSubscription.unsubscribe();
        }
        const userIds = new Set<number>();

        for (const entry of this.poll.entitled_users_at_stop || []) {
            userIds.add(entry.user_id);
            if (entry.vote_delegated_to_id) {
                userIds.add(entry.vote_delegated_to_id);
            }
        }
        this.subscriptions.push(
            (this.entitledUsersSubscription = this.userRepo
                .getViewModelListObservable()
                .pipe(
                    filter(users => !!users.length),
                    map(users => users.filter(user => userIds.has(user.id)))
                )
                .subscribe(users => {
                    const entries = [];
                    for (const entry of this.poll.entitled_users_at_stop || []) {
                        entries.push({
                            ...entry,
                            user: users.find(user => user.id === entry.user_id),
                            voted_verbose: `voted:${entry.voted}`,
                            vote_delegated_to: entry.vote_delegated_to_id
                                ? users.find(user => user.id === entry.vote_delegated_to_id)
                                : null
                        });
                    }
                    this.entitledUsersObservable = from([entries]);
                    this.cd.markForCheck();
                }))
        );
    }

    protected userHasVoteDelegation(user: ViewUser): boolean {
        /**
         * This will be false if the operator does not have "can_see_extra_data"
         */
        if (user.isVoteRightDelegated) {
            return true;
        } else if (this.currentOperator.canVoteFor(user)) {
            return true;
        }

        return false;
    }

    protected getUsersVoteDelegation(user: ViewUser): ViewUser {
        /**
         * This will be false if the operator does not have "can_see_extra_data"
         */
        if (user.isVoteRightDelegated) {
            return user.vote_delegated_to(this.activeMeetingId);
        }

        if (this.currentOperator.canVoteFor(user)) {
            return this.currentOperator;
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.entitledUsersSubscription?.unsubscribe();
        this.entitledUsersSubscription = null;
    }
}
