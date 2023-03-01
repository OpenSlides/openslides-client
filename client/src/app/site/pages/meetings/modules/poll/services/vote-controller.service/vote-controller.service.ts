import { Injectable } from '@angular/core';
import { distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Vote } from 'src/app/domain/models/poll/vote';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewPoll, ViewVote } from '../../../../pages/polls';

@Injectable({
    providedIn: `root`
})
export class VoteControllerService extends BaseMeetingControllerService<ViewVote, Vote> {
    private pollSubscriptions: { [key: Id]: Subscription } = {};

    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: VoteRepositoryService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, Vote, repo);
    }

    public subscribeVoted(...viewPolls: ViewPoll[]): Observable<{ [key: Id]: Id[] }> {
        return new Observable<{ [key: Id]: Id[] }>(subscriber => {
            const current = {};
            // const subscriptions: { [key: Id]: BehaviorSubject<Id[]> } = {};
            for (let poll of viewPolls) {
                const subscription = this.repo.subscribeVoted(poll);

                if (this.pollSubscriptions[poll.id] || !subscription) {
                    continue;
                }

                this.pollSubscriptions[poll.id] = subscription
                    .pipe(distinctUntilChanged())
                    .subscribe(async (voted: Id[] | null | undefined) => {
                        if (voted !== undefined) {
                            await this.setHasVotedOnPoll(poll, voted);
                            current[poll.id] = voted;
                            subscriber.next(current);
                        }
                    });
            }
        });
    }

    public async setHasVotedOnPoll(poll: ViewPoll, voteResp: Id[]): Promise<void> {
        await this.operator.ready;
        poll.hasVoted = voteResp?.some(id => id === this.operator.operatorId) ?? false;
        poll.user_has_voted_for_delegations = voteResp?.filter(id => id !== this.operator.operatorId) ?? [];
    }
}
