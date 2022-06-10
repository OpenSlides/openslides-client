import { Injectable } from '@angular/core';
import { Vote } from 'src/app/domain/models/poll/vote';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPoll, ViewVote } from '../../../../pages/polls';
import { PollServiceModule } from '../poll-service.module';

@Injectable({
    providedIn: PollServiceModule
})
export class VoteControllerService extends BaseMeetingControllerService<ViewVote, Vote> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: VoteRepositoryService
    ) {
        super(controllerServiceCollector, Vote, repo);
    }

    public async setHasVotedOnPoll(...viewPolls: ViewPoll[]): Promise<void> {
        this.repo.setHasVotedOnPoll(...viewPolls);
    }
}
