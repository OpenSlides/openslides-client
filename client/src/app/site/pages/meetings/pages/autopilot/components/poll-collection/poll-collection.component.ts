import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { PollContentObject } from 'src/app/domain/models/poll';
import { PollClassType } from 'src/app/domain/models/poll/poll-constants';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseComponent } from 'src/app/site/base/base.component';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { OperatorService } from 'src/app/site/services/operator.service';

import { getPollDetailSubscriptionConfig, POLL_DETAIL_SUBSCRIPTION } from '../../../polls/polls.subscription';
import { HasPolls, isHavingViewPolls } from '../../../polls/view-models/has-polls';

@Component({
    selector: `os-poll-collection`,
    templateUrl: `./poll-collection.component.html`,
    styleUrls: [`./poll-collection.component.scss`],
    standalone: false
})
export class PollCollectionComponent<C extends PollContentObject> extends BaseComponent implements OnInit, OnDestroy {
    public polls: ViewPoll[] = [];

    public lastPublishedPoll: ViewPoll | null = null;

    public currentSubscribed: Id | null = null;

    private _currentProjection: (Partial<HasPolls<C>> & { readonly fqid: string }) | null = null;

    @Input()
    public disableRunning = false;

    @Input()
    public disableFinished = false;

    @Input()
    public displayInAutopilot = true;

    @Input()
    public set currentProjection(viewModel: (Partial<HasPolls<C>> & { readonly fqid: string }) | null) {
        this._currentProjection = viewModel;
        this.updateLastPublished();
    }

    public get currentProjection(): (Partial<HasPolls<C>> & { readonly fqid: string }) | null {
        return this._currentProjection;
    }

    /**
     * CLEANUP: This function belongs to "HasViewPolls"/ ViewModelWithPolls
     */
    public get hasProjectedModelOpenPolls(): boolean {
        if (isHavingViewPolls(this.currentProjection)) {
            const currPolls: ViewPoll[] = this.currentProjection.polls;
            return currPolls.some((p: ViewPoll) => p.isStarted);
        }
        return false;
    }

    private get showExtendedTitle(): boolean {
        const areAllPollsSameModel = this.polls.every(
            poll => this.polls[0].getContentObject() === poll.getContentObject()
        );

        if (this.currentProjection && areAllPollsSameModel) {
            return this.polls[0]?.getContentObject() !== this.currentProjection;
        } else {
            return !areAllPollsSameModel;
        }
    }

    public constructor(
        protected override translate: TranslateService,
        private repo: PollControllerService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.repo
                .getViewModelListObservable()
                .pipe(map(polls => polls.filter(poll => poll.canBeVotedFor())))
                .subscribe(polls => {
                    this.polls = polls;
                    this.cd.markForCheck();
                    this.updateLastPublished();
                })
        );
    }

    public override ngOnDestroy(): void {
        if (this.currentSubscribed) {
            this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
        }

        super.ngOnDestroy();
    }

    public identifyPoll(index: number, poll: ViewPoll): number {
        return poll.id;
    }

    public getPollVoteTitle(poll: ViewPoll): string {
        const contentObject = poll.getContentObject();
        const listTitle = contentObject.getListTitle();
        const objectCollection = contentObject.COLLECTION;
        const pollTitle = poll.getTitle();

        if (
            this.showExtendedTitle &&
            contentObject?.fqid !== this.currentProjection?.fqid &&
            [Topic.COLLECTION, Assignment.COLLECTION].includes(objectCollection)
        ) {
            return `${listTitle}: ${pollTitle}`;
        } else {
            return pollTitle;
        }
    }

    /**
     * TODO: Some non abstract base poll service was required
     * @param poll
     */
    public canManagePoll(poll: ViewPoll): boolean {
        if (poll.pollClassType === PollClassType.Motion) {
            return this.operator.hasPerms(this.permission.motionCanManagePolls);
        } else if (poll.pollClassType === PollClassType.Assignment) {
            return this.operator.hasPerms(this.permission.assignmentCanManage);
        } else if (poll.pollClassType === PollClassType.Topic) {
            return this.operator.hasPerms(this.permission.pollCanManage);
        }
        return false;
    }

    /**
     * Helper function to detect new latest published polls and set them.
     */
    private updateLastPublished(): void {
        const lastPublished = this.getLastfinshedPoll(this.currentProjection!);
        if (lastPublished !== this.lastPublishedPoll) {
            if (
                (this.currentProjection as BaseViewModel)?.collection === `meeting` &&
                lastPublished &&
                lastPublished.id !== this.currentSubscribed
            ) {
                this.modelRequestService.subscribeTo({
                    ...getPollDetailSubscriptionConfig(lastPublished.id),
                    subscriptionName: `${POLL_DETAIL_SUBSCRIPTION}_${lastPublished.id}`
                });
                if (this.currentSubscribed) {
                    this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
                }
                this.currentSubscribed = lastPublished.id;
            } else if (this.currentSubscribed && lastPublished?.id !== this.currentSubscribed) {
                this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
                this.currentSubscribed = null;
            }

            this.lastPublishedPoll = lastPublished;
            this.cd.markForCheck();
        }
    }

    /**
     * CLEANUP: This function belongs to "HasViewPolls"/ ViewModelWithPolls
     * *class* (is an interface right now)
     *
     * @param viewModel
     */
    private getLastfinshedPoll(viewModel: Partial<HasPolls<C>>): ViewPoll | null {
        if (isHavingViewPolls(viewModel)) {
            let currPolls: ViewPoll[] = viewModel.polls;
            /**
             * Although it should, since the union type could use `.filter
             * without any problem, without an any cast it will not work
             */
            currPolls = (currPolls as any[]).filter((p: ViewPoll) => p.stateHasVotes).reverse();
            return currPolls[0];
        }
        return null;
    }
}
