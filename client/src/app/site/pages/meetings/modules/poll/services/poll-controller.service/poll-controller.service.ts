import { Injectable } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';
import { VoteDecryptGatewayService } from 'src/app/gateways/vote-decrypt-gateway.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

import { ViewPoll } from '../../../../pages/polls';

function getRandomString(length: number): string {
    return Array.from({ length: length }, () => Math.floor(Math.random() * 62))
        .map(num => (num < 10 ? num : String.fromCharCode(num < 36 ? num + 55 : num + 61)))
        .join(``);
}

@Injectable({ providedIn: `root` })
export class PollControllerService extends BaseMeetingControllerService<ViewPoll, Poll> {
    public get tokens(): { [poll_id: number]: { [user_id: number]: string } } {
        return this._tokens;
    }

    public tokensSubject = new BehaviorSubject<{ [poll_id: number]: { [user_id: number]: string } }>({});

    private _tokens: { [poll_id: number]: { [user_id: number]: string } } = {};

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PollRepositoryService,
        protected voteRepo: VoteRepositoryService,
        private voteCrypto: VoteDecryptGatewayService,
        private lifecycle: LifecycleService
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

        this.voteCrypto.initialize();
        this.lifecycle.openslidesShutdowned.subscribe(() => {
            this._tokens = {};
            this.tokensSubject.next(this._tokens);
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

    public vote(poll: Identifiable, options: { value: any; user_id: Id }): Promise<void> {
        const viewPoll = this.getViewModel(poll.id);
        const token = getRandomString(8);
        if (viewPoll?.type === PollType.Cryptographic) {
            if (!this._tokens[poll.id]) {
                this._tokens[poll.id] = {};
            }
            this._tokens[poll.id][options.user_id] = token;
            this.tokensSubject.next(this._tokens);
        }
        return this.repo.vote(viewPoll, options, token);
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
