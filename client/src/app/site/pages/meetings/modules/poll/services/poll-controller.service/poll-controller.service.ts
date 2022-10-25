import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { VoteDecryptGatewayService } from 'src/app/gateways/vote-decrypt-gateway.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPoll } from '../../../../pages/polls';
import { PollServiceModule } from '../poll-service.module';

function getRandomString(length: number) {
    return Array<number>
        .from({ length: length }, () => Math.floor(Math.random() * 62))
        .map(num => (num < 10 ? num : String.fromCharCode(num < 36 ? num + 55 : num + 61)))
        .join(``);
}

@Injectable({ providedIn: PollServiceModule })
export class PollControllerService extends BaseMeetingControllerService<ViewPoll, Poll> {
    public get tokens(): { [poll_id: number]: { [user_id: number]: string } } {
        return this._tokens;
    }

    public tokensSubject = new BehaviorSubject<{ [poll_id: number]: { [user_id: number]: string } }>({});

    private _tokens: { [poll_id: number]: { [user_id: number]: string } } = {};

    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PollRepositoryService,
        private dialog: MatDialog,
        private voteCrypto: VoteDecryptGatewayService
    ) {
        super(controllerServiceCollector, Poll, repo);

        this.voteCrypto.initialize();
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

    public getViewModelListByContentObject(fqid: Fqid): ViewPoll[] {
        return this.getViewModelList().filter(_poll => _poll.content_object_id === fqid);
    }

    public anonymize(poll: Identifiable): Promise<void> {
        return this.repo.anonymize(poll);
    }
}
