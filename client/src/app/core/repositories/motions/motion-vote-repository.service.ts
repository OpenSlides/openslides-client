import { Injectable } from '@angular/core';


import { RelationDefinition } from 'app/core/definitions/relations';
import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { ViewMotionVote } from 'app/site/motions/models/view-motion-vote';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

const MotionVoteRelations: RelationDefinition[] = [
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
        foreignViewModel: ViewMotionOption
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
export class MotionVoteRepositoryService extends BaseRepository<ViewMotionVote, MotionVote, object> {
    /**
     * @param DS DataStore access
     * @param dataSend Sending data
     * @param mapperService Map models to object
     * @param viewModelStoreService Access view models
     * @param translate Translate string
     * @param httpService make HTTP Requests
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionVote, MotionVoteRelations);
    }

    public getTitle = (titleInformation: object) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };
}
