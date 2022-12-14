import { ChangeDetectorRef, Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { PollContentObject } from 'src/app/domain/models/poll';
import { PollType } from 'src/app/domain/models/poll';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { ScrollingTableManageService } from 'src/app/ui/modules/scrolling-table';

import { GroupControllerService } from '../../../pages/participants/modules/groups/services/group-controller.service';
import { CheckVoteValidityDialogComponent } from '../components/check-vote-validity-dialog/check-vote-validity-dialog.component';
import { EntitledUsersTableEntry } from '../definitions';
import { PollService } from '../services/poll.service';
import { PollDialogService } from '../services/poll-dialog.service';
import { VoteControllerService } from '../services/vote-controller.service';
import { BasePollPdfService } from './base-poll-pdf.service';

export interface BaseVoteData extends Identifiable {
    user?: ViewUser;
}

export const VOTE_OPTION_STYLE: any = {
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

@Directive()
export abstract class BasePollDetailComponent<V extends PollContentObject, S extends PollService>
    extends BaseMeetingComponent
    implements OnInit, OnDestroy
{
    public readonly COLLECTION = ViewPoll.COLLECTION;

    /**
     * All the groups of users.
     */
    public userGroups: ViewGroup[] = [];

    /**
     * Holding all groups.
     */
    public groupObservable: Observable<ViewGroup[]> | null = null;

    /**
     * Details for the iconification of the votes
     */
    public readonly voteOptionStyle: any = VOTE_OPTION_STYLE;

    /**
     * The reference to the poll.
     */
    public poll!: ViewPoll<V>;

    /**
     * The different labels for the votes (used for chart).
     */
    public labels: string[] = [];

    // The observable for the votes-per-user table
    public get votesDataObservable(): Observable<BaseVoteData[]> {
        return this._votesDataSubject;
    }

    // The observable for the entitled-users-table
    public get entitledUsersObservable(): Observable<EntitledUsersTableEntry[]> {
        return this._entitledUsersSubject;
    }

    public get self(): BasePollDetailComponent<V, S> {
        return this;
    }

    public get isViewingVoteslist(): boolean {
        return this._isViewingVoteslist;
    }

    public get isViewingEntitledUserslist(): boolean {
        return this._isViewingEntitledUserslist;
    }

    public get canSeeCheckValidity(): boolean {
        return this.poll.type === PollType.Cryptographic && !!this.poll.votes_raw;
    }

    private _isViewingEntitledUserslist = false;

    private _isViewingVoteslist = true;

    protected optionsLoaded = new Deferred();

    private entitledUsersSubscription: Subscription | null = null;

    public voteWeightEnabled: Observable<boolean> = this.meetingSettingsService.get(`users_enable_vote_weight`);

    protected get canSeeVotes(): boolean {
        return (this.hasPerms() && this.poll!.isFinished) || this.poll!.isPublished;
    }

    protected get contentObjectId(): Id | undefined {
        return this.poll?.getContentObject()?.id;
    }

    private _entitledUsersSubject = new BehaviorSubject<EntitledUsersTableEntry[]>([]);
    private _votesDataSubject = new BehaviorSubject<BaseVoteData[]>([]);
    private _currentOperator!: ViewUser;
    private _pollId!: Id;

    protected repo = inject(PollControllerService);
    protected route = inject(ActivatedRoute);
    protected groupRepo = inject(GroupControllerService);
    protected promptService = inject(PromptService);
    protected votesRepo = inject(VoteControllerService);
    protected operator = inject(OperatorService);
    protected cd = inject(ChangeDetectorRef);
    protected userRepo = inject(ParticipantControllerService);
    private scrollTableManage = inject(ScrollingTableManageService);

    public constructor(
        protected pollService: S,
        private pollPdfService: BasePollPdfService,
        private dialog: PollDialogService
    ) {
        super();

        this.subscriptions.push(
            this.operator.userObservable.subscribe(currentUser => {
                this._currentOperator = currentUser!;
            })
        );
    }

    /**
     * OnInit-method.
     */
    public ngOnInit(): void {
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

    // /**
    //  * Opens dialog for editing the poll
    //  */
    // public openDialog(viewPoll: V): void {
    //     this.pollDialog.openDialog(viewPoll);
    // }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._pollId = id;
            this.loadComponentById();
        }
    }

    public exportPollResults(): void {
        this.pollPdfService.exportSinglePoll(this.poll, {
            votesData: this._votesDataSubject.value,
            entitledUsersData: this._entitledUsersSubject.value
        });
    }

    protected onStateChanged(): void {}

    protected abstract hasPerms(): boolean;

    protected abstract onDeleted(): void;

    /**
     * Set the votes data.
     */
    protected setVotesData(data: BaseVoteData[]): void {
        this._votesDataSubject.next(data);
    }

    protected onAfterSetVotesData(): void {}

    /**
     * Is called when the underlying vote data changes. Is supposed to call setVotesData
     */
    protected abstract createVotesData(): BaseVoteData[];

    private loadComponentById(): void {
        this.subscriptions.push(
            this.repo.getViewModelObservable(this._pollId).subscribe(poll => {
                if (poll) {
                    this.poll = poll!;
                    this.setVotesAndEntitledUsersData();
                }
            }),
            this.userRepo.getViewModelListObservable().subscribe(() => this.setVotesAndEntitledUsersData())
        );
    }

    private setVotesAndEntitledUsersData(): void {
        this.setVotesData(this.createVotesData());
        this.onAfterSetVotesData();
        this.setEntitledUsersData();
    }

    private setEntitledUsersData(): void {
        if (this.entitledUsersSubscription) {
            this.entitledUsersSubscription.unsubscribe();
        }
        const userIds = new Set<number>();

        for (const entry of this.poll.entitled_users_at_stop || []) {
            userIds.add(entry.user_id);
            if (entry.vote_delegated_to_user_id) {
                userIds.add(entry.vote_delegated_to_user_id);
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
                    const entries: EntitledUsersTableEntry[] = [];
                    for (const entry of this.poll.entitled_users_at_stop || []) {
                        entries.push({
                            ...entry,
                            id: entry.user_id,
                            user: users.find(user => user.id === entry.user_id),
                            voted_verbose: `voted:${entry.voted}`,
                            vote_delegated_to: entry.vote_delegated_to_user_id
                                ? users.find(user => user.id === entry.vote_delegated_to_user_id)
                                : null
                        });
                    }
                    this._entitledUsersSubject.next(entries);
                    this.cd.markForCheck();
                }))
        );
    }

    public hasUserVoteDelegation(user: ViewUser): boolean {
        if (user.isVoteRightDelegated || this._currentOperator.canVoteFor(user)) {
            return true;
        }
        return false;
    }

    public getUsersVoteDelegation(user: ViewUser): ViewUser | null {
        if (user.isVoteRightDelegated) {
            return (
                user.vote_delegated_to(this.activeMeetingId!) ??
                this.userRepo.getViewModel(user.vote_delegated_to_id(this.activeMeetingId))
            );
        }

        if (this._currentOperator.canVoteFor(user)) {
            return this._currentOperator;
        }

        return null;
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.entitledUsersSubscription?.unsubscribe();
        this.entitledUsersSubscription = null;
    }

    public onTabChange(): void {
        const isSwitchingToEntitledList = this._isViewingVoteslist === true;
        //only set the new list after the old cell definitions have been deleted
        const clearSubscription = this.scrollTableManage.cellDefinitionsObservable.subscribe(data => {
            if (!data.length) {
                this.toggleIsViewing(!isSwitchingToEntitledList, isSwitchingToEntitledList);
                clearSubscription.unsubscribe();
            }
        });
        this.toggleIsViewing(isSwitchingToEntitledList, !isSwitchingToEntitledList);
    }

    private toggleIsViewing(votesList: boolean, entitledUsersList: boolean): void {
        if (votesList) {
            this._isViewingVoteslist = !this.isViewingVoteslist;
        }
        if (entitledUsersList) {
            this._isViewingEntitledUserslist = !this.isViewingEntitledUserslist;
        }
    }

    public openCheckValidityDialog(): void {
        this.dialog.open(CheckVoteValidityDialogComponent, { ...infoDialogSettings, data: this.poll });
    }
}
