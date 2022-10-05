import { Injectable } from '@angular/core';
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
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: VoteRepositoryService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, Vote, repo);
    }

    public async setHasVotedOnPoll(...viewPolls: ViewPoll[]): Promise<void> {
        const pollIds: Id[] = viewPolls.map(poll => poll.id);
        const voteResp = await this.repo.hasVotedFor(...pollIds);

        await this.operator.ready;
        if (voteResp) {
            for (const poll of viewPolls) {
                poll.hasVoted = voteResp[poll.id]?.some(id => id === this.operator.operatorId) ?? false;
                poll.user_has_voted_for_delegations =
                    voteResp[poll.id]?.filter(id => id !== this.operator.operatorId) ?? [];
            }
        }
    }
}
