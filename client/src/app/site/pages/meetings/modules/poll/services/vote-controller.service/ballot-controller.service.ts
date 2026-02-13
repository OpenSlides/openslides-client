import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Ballot } from 'src/app/domain/models/poll/ballot';
import { BallotRepositoryService } from 'src/app/gateways/repositories/polls/ballot-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewBallot, ViewPoll } from '../../../../pages/polls';

@Injectable({
    providedIn: `root`
})
export class BallotControllerService extends BaseMeetingControllerService<ViewBallot, Ballot> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: BallotRepositoryService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, Ballot, repo);
    }

    public subscribeVoted(...viewPolls: ViewPoll[]): Observable<Record<Id, Id[]>> {
        return new Observable<Record<Id, Id[]>>(subscriber => {
            const current = {};
            for (const poll of viewPolls) {
                const subscription =
                    !this.operator.isAnonymousLoggedIn && this.operator.user
                        ? this.repo.subscribeVoted(poll, [
                              this.operator.user.id,
                              ...(this.operator.user.vote_delegations_from_ids() || [])
                          ])
                        : null;

                if (!subscription) {
                    continue;
                }

                if (subscription.value !== undefined) {
                    current[poll.id] = subscription.value;
                }

                subscription.subscribe({
                    next: async (voted: Id[] | null | undefined) => {
                        if (voted !== undefined) {
                            await this.setHasVotedOnPoll(poll, voted);

                            current[poll.id] = voted;
                            subscriber.next(current);
                        }
                    },
                    complete: () => {
                        subscriber.complete();
                    }
                });
            }

            subscriber.next(current);
        });
    }

    public async setHasVotedOnPoll(poll: ViewPoll, voteResp: Id[]): Promise<void> {
        await this.operator.ready;
        poll.hasVoted = voteResp?.some(id => id === this.operator.operatorId) ?? false;
        poll.user_has_voted_for_delegations = voteResp?.filter(id => id !== this.operator.operatorId) ?? [];
    }
}
