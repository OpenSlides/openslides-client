import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Ballot } from 'src/app/domain/models/poll/ballot';
import { BallotRepositoryService } from 'src/app/gateways/repositories/polls/ballot-repository.service';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewBallot, ViewPoll } from '../../../../pages/polls';

@Injectable({
    providedIn: `root`
})
export class BallotControllerService extends BaseMeetingControllerService<ViewBallot, Ballot> {
    private pollRepo = inject(PollRepositoryService);

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: BallotRepositoryService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, Ballot, repo);
    }

    public subscribeVoted(...viewPolls: ViewPoll[]): Observable<Record<Id, boolean>> {
        const userIds = [this.operator.user.id, ...(this.operator.user.vote_delegations_from_ids() || [])];
        return combineLatest(
            viewPolls.map(poll => {
                return combineLatest(userIds.map(userId => this.pollRepo.pollBallotsByUser(poll.id, userId))).pipe(
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
