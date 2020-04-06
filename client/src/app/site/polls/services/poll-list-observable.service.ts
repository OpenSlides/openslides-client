import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { HasViewModelListObservable } from 'app/core/definitions/has-view-model-list-observable';
import { AssignmentPollRepositoryService } from 'app/core/repositories/assignments/assignment-poll-repository.service';
import { MotionPollRepositoryService } from 'app/core/repositories/motions/motion-poll-repository.service';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { BaseViewPoll, PollClassType } from '../models/base-view-poll';

@Injectable({
    providedIn: 'root'
})
export class PollListObservableService implements HasViewModelListObservable<BaseViewPoll> {
    // protected so tslint doesn't complain
    protected motionPolls: ViewMotionPoll[] = [];
    protected assignmentPolls: ViewAssignmentPoll[] = [];

    private readonly viewPollListSubject: BehaviorSubject<BaseViewPoll[]> = new BehaviorSubject<BaseViewPoll[]>([]);

    public constructor(
        motionPollRepo: MotionPollRepositoryService,
        assignmentPollRepo: AssignmentPollRepositoryService,
        private mapper: CollectionMapperService
    ) {
        motionPollRepo
            .getViewModelListObservable()
            .subscribe(polls => this.adjustViewModelListObservable(polls, PollClassType.Motion));
        assignmentPollRepo
            .getViewModelListObservable()
            .subscribe(polls => this.adjustViewModelListObservable(polls, PollClassType.Assignment));
    }

    private adjustViewModelListObservable(polls: BaseViewPoll[], mode: PollClassType): void {
        this[mode + 'Polls'] = polls;

        const allPolls = (this.motionPolls as BaseViewPoll[]).concat(this.assignmentPolls);
        this.viewPollListSubject.next(allPolls);
    }

    public getViewModelListObservable(): Observable<BaseViewPoll[]> {
        return this.viewPollListSubject.asObservable();
    }

    public getObservableFromViewModel(poll: BaseViewPoll): Observable<BaseViewModel> {
        return this.mapper.getRepository(poll.collection).getViewModelObservable(poll.id);
    }
}
