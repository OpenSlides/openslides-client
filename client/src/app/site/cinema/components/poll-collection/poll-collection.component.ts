import { Component, Input, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseComponent } from 'app/site/base/components/base.component';
import { BaseViewPoll } from 'app/site/polls/models/base-view-poll';
import { PollListObservableService } from 'app/site/polls/services/poll-list-observable.service';

@Component({
    selector: 'os-poll-collection',
    templateUrl: './poll-collection.component.html',
    styleUrls: ['./poll-collection.component.scss']
})
export class PollCollectionComponent extends BaseComponent implements OnInit {
    public polls: BaseViewPoll[];

    @Input()
    private currentProjection: BaseViewModel<any>;

    private get showExtendedTitle(): boolean {
        const areAllPollsSameModel = this.polls.every(
            poll => this.polls[0].getContentObject() === poll.getContentObject()
        );

        if (this.currentProjection && areAllPollsSameModel) {
            return this.polls[0].getContentObject() !== this.currentProjection;
        } else {
            return !areAllPollsSameModel;
        }
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private pollService: PollListObservableService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.pollService
                .getViewModelListObservable()
                .pipe(map(polls => polls.filter(poll => poll.canBeVotedFor())))
                .subscribe(polls => {
                    this.polls = polls;
                })
        );
    }

    public getPollVoteTitle(poll: BaseViewPoll): string {
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

    public getPollDetailLink(poll: BaseViewPoll): string {
        return poll.parentLink;
    }
}
