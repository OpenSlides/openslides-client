import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { PollClassType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseComponent } from 'app/site/base/components/base.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { map } from 'rxjs/operators';

@Component({
    selector: `os-poll-collection`,
    templateUrl: `./poll-collection.component.html`,
    styleUrls: [`./poll-collection.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollCollectionComponent extends BaseModelContextComponent implements OnInit {
    public polls: ViewPoll[];

    public lastPublishedPoll: ViewPoll;

    private _currentProjection: BaseProjectableViewModel<any>;

    @Input()
    public set currentProjection(viewModel: BaseProjectableViewModel<any>) {
        this._currentProjection = viewModel;
        this.updateLastPublished();
    }

    public get currentProjection(): BaseProjectableViewModel<any> {
        return this._currentProjection;
    }

    /**
     * CLEANUP: This function belongs to "HasViewPolls"/ ViewModelWithPolls
     */
    public get hasProjectedModelOpenPolls(): boolean {
        if (this.currentProjection instanceof ViewMotion || this.currentProjection instanceof ViewAssignment) {
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
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private repo: PollRepositoryService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.ngOnInit();
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

        if (this.showExtendedTitle) {
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
        }
        return false;
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `poll_ids`,
                    follow: [
                        {
                            idField: `option_ids`,
                            follow: [{ idField: `vote_ids` }, { idField: `content_object_id` }]
                        },
                        {
                            idField: `global_option_id`,
                            follow: [{ idField: `vote_ids` }]
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Helper function to detect new latest published polls and set them.
     */
    private updateLastPublished(): void {
        const lastPublished = this.getLastfinshedPoll(this.currentProjection);
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
    private getLastfinshedPoll(viewModel: BaseViewModel): ViewPoll {
        if (viewModel instanceof ViewMotion || viewModel instanceof ViewAssignment) {
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
