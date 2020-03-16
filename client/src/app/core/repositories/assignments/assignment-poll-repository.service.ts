import { Injectable } from '@angular/core';


import { HttpService } from 'app/core/core-services/http.service';
import { RelationDefinition } from 'app/core/definitions/relations';
import { BasePollRepository } from 'app/core/repositories/base-poll-repository';
import { VotingService } from 'app/core/ui-services/voting.service';
import { AssignmentPoll } from 'app/shared/models/assignments/assignment-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { AssignmentPollTitleInformation, ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { RepositoryServiceCollector } from '../repository-service-collector';

const AssignmentPollRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'groups_id',
        ownKey: 'groups',
        foreignViewModel: ViewGroup
    },
    {
        type: 'O2M',
        ownIdKey: 'options_id',
        ownKey: 'options',
        foreignViewModel: ViewAssignmentOption
    },
    {
        type: 'M2O',
        ownIdKey: 'assignment_id',
        ownKey: 'assignment',
        foreignViewModel: ViewAssignment
    },
    {
        type: 'M2M',
        ownIdKey: 'voted_id',
        ownKey: 'voted',
        foreignViewModel: ViewUser
    }
];

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
export class AssignmentPollRepositoryService extends BasePollRepository<
    ViewAssignmentPoll,
    AssignmentPoll,
    AssignmentPollTitleInformation
> {
    /**
     * Constructor for the Assignment Repository.
     *
     * @param DS DataStore access
     * @param dataSend Sending data
     * @param mapperService Map models to object
     * @param viewModelStoreService Access view models
     * @param translate Translate string
     * @param httpService make HTTP Requests
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        votingService: VotingService,
        http: HttpService
    ) {
        super(repositoryServiceCollector, AssignmentPoll, AssignmentPollRelations, {}, votingService, http);
    }

    public getTitle = (titleInformation: AssignmentPollTitleInformation) => {
        return titleInformation.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Polls' : 'Poll');
    };

    public vote(data: VotingData, poll_id: number): Promise<void> {
        let requestData;
        if (data.global) {
            requestData = `"${data.global}"`;
        } else {
            requestData = data.votes;
        }

        return this.http.post(`/rest/assignments/assignment-poll/${poll_id}/vote/`, requestData);
    }
}
