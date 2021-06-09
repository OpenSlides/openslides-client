import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { OperatorService } from 'app/core/core-services/operator.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PollClassType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';

@Component({
    selector: 'os-poll-collection',
    templateUrl: './poll-collection.component.html',
    styleUrls: ['./poll-collection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollCollectionComponent extends BaseComponent implements OnInit {
    public polls: ViewPoll[];

    public lastPublishedPoll: ViewPoll;

    private _currentProjection: BaseViewModel<any>;

    public get currentProjection(): BaseViewModel<any> {
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

    @Input()
    public set currentProjection(viewModel: BaseViewModel<any>) {
        this._currentProjection = viewModel;
        this.updateLastPublished();
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
        private repo: PollRepositoryService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.repo
                .getViewModelListObservable()
                .pipe(
                    map(polls => {
                        return polls.filter(poll => {
                            return poll.canBeVotedFor();
                        });
                    })
                )
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
