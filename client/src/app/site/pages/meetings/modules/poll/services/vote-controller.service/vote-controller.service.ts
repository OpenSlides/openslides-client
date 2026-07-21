import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Vote } from '@app/domain/models/poll/vote';
import { VoteRepositoryService } from '@app/gateways/repositories/polls/vote-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { OperatorService } from '@app/site/services/operator.service';
import { Observable } from 'rxjs';

import { ViewPoll, ViewVote } from '../../../../pages/polls';

@Service()
export class VoteControllerService extends BaseMeetingControllerService<ViewVote, Vote> {
    protected override repo: VoteRepositoryService;
    private operator = inject(OperatorService);

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(VoteRepositoryService);
        super(controllerServiceCollector, Vote, repo);
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
