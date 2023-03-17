import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { PollContentObject } from 'src/app/domain/models/poll';
import { PollClassType } from 'src/app/domain/models/poll/poll-constants';
import { BaseComponent } from 'src/app/site/base/base.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { HasPolls, isHavingViewPolls } from '../../../polls/view-models/has-polls';

@Component({
    selector: `os-poll-collection`,
    templateUrl: `./poll-collection.component.html`,
    styleUrls: [`./poll-collection.component.scss`]
})
export class PollCollectionComponent<C extends PollContentObject> extends BaseComponent implements OnInit {
    public polls: ViewPoll[] = [];

    public lastPublishedPoll: ViewPoll | null = null;

    private _currentProjection: Partial<HasPolls<C>> | null = null;

    @Input()
    public set currentProjection(viewModel: Partial<HasPolls<C>> | null) {
        this._currentProjection = viewModel;
        this.updateLastPublished();
    }

    public get currentProjection(): Partial<HasPolls<C>> | null {
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
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private repo: PollControllerService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
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

    public identifyPoll(index: number, poll: ViewPoll): number {
        return poll.id;
    }

    public getPollVoteTitle(poll: ViewPoll): string {
        const contentObject = poll.getContentObject();
        const listTitle = contentObject.getListTitle();
        const model = contentObject.getVerboseName();
        const pollTitle = poll.getTitle();

        if (this.showExtendedTitle && contentObject !== this.currentProjection) {
            return `(${model}) ${listTitle} - ${pollTitle}`;
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
