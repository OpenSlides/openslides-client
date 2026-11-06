import { inject, Injectable } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { PollBallot } from '@app/domain/models/poll/poll-ballot';
import { PollBallotRepositoryService } from '@app/gateways/repositories/polls/poll-ballot-repository.service';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { combineLatest, map, Observable } from 'rxjs';

import { ViewPollBallot } from '../../../../pages/polls/view-models/poll-ballot';

@Injectable({
    providedIn: `root`
})
export class PollBallotControllerService extends BaseMeetingControllerService<ViewPollBallot, PollBallot> {
    protected repo = inject(PollBallotRepositoryService);

    private pollRepo = inject(PollRepositoryService);
    private operator = inject(OperatorService);

    protected baseModelCtor = PollBallot;

    public subscribeVoted(...viewPolls: ViewPoll[]): Observable<Record<Id, boolean>> {
        const userIds = [this.operator.user.id, ...(this.operator.user.vote_delegations_from_ids() || [])];
        return combineLatest(
            viewPolls.map(poll => {
                return combineLatest(userIds.map(userId => this.pollRepo.pollBallotUsersByUser(poll.id, userId))).pipe(
                    map(ballots => !!ballots.map(b => !!b.length).some(b => b))
                );
            })
        ).pipe(
            map(voted => {
                return Object.fromEntries(viewPolls.map((p, i) => [p.id, voted[i]]));
            })
        );
    }
}
