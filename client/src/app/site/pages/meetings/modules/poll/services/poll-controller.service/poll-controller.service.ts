import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HasMeetingId, Identifiable } from 'src/app/domain/interfaces';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { BallotRepositoryService } from 'src/app/gateways/repositories/polls/ballot-repository.service';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { PollCreatePayload, PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPoll } from '../../../../pages/polls';

@Injectable({ providedIn: `root` })
export class PollControllerService extends BaseMeetingControllerService<ViewPoll, Poll> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PollRepositoryService,
        protected voteRepo: BallotRepositoryService
    ) {
        super(controllerServiceCollector, Poll, repo);
    }

    public getViewModelListObservableOfStarted(): Observable<ViewPoll[]> {
        return this.getViewModelListObservable().pipe(map(polls => polls.filter(p => p.isStarted)));
    }

    public getViewModelListByContentObject(fqid: Fqid): ViewPoll[] {
        return this.getViewModelList().filter(poll => poll.content_object_id === fqid);
    }

    public create(contentObject: BaseModel<any> & HasMeetingId, payload: PollUpdatePayload): Promise<Identifiable> {
        const createPayload: PollCreatePayload = {
            ...payload,
            content_object_id: contentObject.fqid,
            meeting_id: contentObject.meeting_id
        };

        return this.repo.create(createPayload);
    }

    public update(_pollID: Id, _payload: any): Promise<void> {
        throw new Error(`not implemented`);
        /*
        const optionUpdatePayload = poll.options.map((option, index) => ({
            id: option.id,
            ...payload.options[index]
        }));
        return this.repo.update(payload, poll, optionUpdatePayload);
        */
    }

    public delete(poll: Identifiable): Promise<void> {
        return this.repo.delete(poll);
    }

    public changePollState(poll: Identifiable, targetState: PollState): Promise<void> {
        return this.repo.changePollState(poll, targetState);
    }

    public anonymize(poll: Identifiable, publish?: boolean): Promise<void> {
        return this.repo.anonymize(poll, publish);
    }

    public publish(poll: Identifiable): Promise<void> {
        return this.repo.publishPoll(poll);
    }
}
