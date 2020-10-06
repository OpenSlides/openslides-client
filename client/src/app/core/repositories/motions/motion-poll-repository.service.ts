import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { BasePollRepository } from 'app/core/repositories/base-poll-repository';
import { VotingService } from 'app/core/ui-services/voting.service';
import { MotionPoll } from 'app/shared/models/motions/motion-poll';
import { VoteValue } from 'app/shared/models/poll/base-vote';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { RepositoryServiceCollector } from '../repository-service-collector';

export interface MotionAnalogVoteData {
    Y: number;
    N: number;
    A?: number; // Only if pollmethod is YNA
    votesvalid?: number;
    votesinvalid?: number;
    votescast?: number;
}

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollRepositoryService extends BasePollRepository<ViewMotionPoll, MotionPoll> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        votingService: VotingService,
        http: HttpService
    ) {
        super(repositoryServiceCollector, MotionPoll, votingService, http);
    }

    public getTitle = (viewMotionPoll: ViewMotionPoll) => {
        return viewMotionPoll.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Polls' : 'Poll');
    };

    public vote(vote: VoteValue, poll_id: number): Promise<void> {
        return this.http.post(`/rest/motions/motion-poll/${poll_id}/vote/`, JSON.stringify(vote));
    }
}
