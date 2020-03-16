import { Injectable } from '@angular/core';


import { RelationDefinition } from 'app/core/definitions/relations';
import { AssignmentVote } from 'app/shared/models/assignments/assignment-vote';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { ViewAssignmentVote } from 'app/site/assignments/models/view-assignment-vote';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

const AssignmentVoteRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'user_id',
        ownKey: 'user',
        foreignViewModel: ViewUser
    },
    {
        type: 'M2O',
        ownIdKey: 'option_id',
        ownKey: 'option',
        foreignViewModel: ViewAssignmentOption
    }
];

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentVoteRepositoryService extends BaseRepository<ViewAssignmentVote, AssignmentVote, object> {
    /**
     * @param DS DataStore access
     * @param dataSend Sending data
     * @param mapperService Map models to object
     * @param viewModelStoreService Access view models
     * @param translate Translate string
     * @param httpService make HTTP Requests
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentVote, AssignmentVoteRelations);
    }

    public getTitle = (titleInformation: object) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };

    public getVotesForUser(pollId: number, userId: number): ViewAssignmentVote[] {
        return this.getViewModelList().filter(vote => vote.option.poll_id === pollId && vote.user_id === userId);
    }
}
