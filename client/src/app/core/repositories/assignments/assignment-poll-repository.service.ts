import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { BasePollRepository } from 'app/core/repositories/base-poll-repository';
import { AssignmentPoll } from 'app/shared/models/assignments/assignment-poll';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { UserVote } from 'app/shared/models/poll/base-vote';

export interface AssignmentAnalogVoteData {
    options: {
        [key: number]: {
            Y: number;
            N?: number;
            A?: number;
        };
    };
    votesvalid?: number;
    votesinvalid?: number;
    votescast?: number;
    global_no?: number;
    global_abstain?: number;
}

export interface VotingData {
    votes: Object;
    global?: GlobalVote;
}

export type GlobalVote = 'A' | 'N';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentPollRepositoryService extends BasePollRepository<ViewAssignmentPoll, AssignmentPoll> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        http: HttpService
    ) {
        super(repositoryServiceCollector, AssignmentPoll, http);
    }

    public getTitle = (viewAssignmentPoll: ViewAssignmentPoll) => {
        return viewAssignmentPoll.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Polls' : 'Poll');
    };

    public vote(data: VotingData, poll_id: number, userId?: number): Promise<void> {
        const requestData: UserVote = {
            data: data.global ?? data.votes,
            user_id: userId ?? undefined
        };
        return this.http.post(`/rest/assignments/assignment-poll/${poll_id}/vote/`, requestData);
    }
}
