import { Injectable } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPoll } from '../../../../pages/polls';

@Injectable({ providedIn: `root` })
export class PollControllerService extends BaseMeetingControllerService<ViewPoll, Poll> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PollRepositoryService,
        protected voteRepo: VoteRepositoryService
    ) {
        super(controllerServiceCollector, Poll, repo);

        this.getViewModelListObservableOfStarted()
            .pipe(
                distinctUntilChanged((previous, current) => {
                    const prevStarted = previous.map(p => p.id);
                    const currStarted = current.map(p => p.id);

                    return prevStarted.length === currStarted.length && currStarted.equals(prevStarted);
                }),
                map(value => value.map(p => p.id))
            )
            .subscribe(startedPolls => {
                this.voteRepo.updateStartedPolls(startedPolls);
            });
    }

    public create(payload: any): Promise<Identifiable> {
        return this.repo.create(payload);
    }

    public update(payload: any, poll: ViewPoll): Promise<void> {
        const optionUpdatePayload = poll.options.map((option, index) => ({
            id: option.id,
            ...payload.options[index]
        }));
        return this.repo.update(payload, poll, optionUpdatePayload);
    }

    public delete(poll: Identifiable): Promise<void> {
        return this.repo.delete(poll);
    }

    public changePollState(poll: Identifiable, targetState: PollState): Promise<void> {
        return this.repo.changePollState(poll, targetState);
    }

    public vote(poll: Identifiable, options: any): Promise<void> {
        return this.repo.vote(poll, options);
    }

    public getViewModelListObservableOfStarted(): Observable<ViewPoll[]> {
        return this.getViewModelListObservable().pipe(map(polls => polls.filter(p => p.isStarted)));
    }

    public getViewModelListByContentObject(fqid: Fqid): ViewPoll[] {
        return this.getViewModelList().filter(_poll => _poll.content_object_id === fqid);
    }

    public anonymize(poll: Identifiable): Promise<void> {
        return this.repo.anonymize(poll);
    }
}
