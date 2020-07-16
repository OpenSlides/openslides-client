import { Injectable } from '@angular/core';

import { AssignmentVote } from 'app/shared/models/assignments/assignment-vote';
import { ViewAssignmentVote } from 'app/site/assignments/models/view-assignment-vote';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentVoteRepositoryService extends BaseRepository<ViewAssignmentVote, AssignmentVote> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentVote);
    }

    public getTitle = (viewAssignmentVote: ViewAssignmentVote) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };

    public getVotesForUser(pollId: number, userId: number): ViewAssignmentVote[] {
        return this.getViewModelList().filter(vote => vote.option.poll_id === pollId && vote.user_id === userId);
    }
}
