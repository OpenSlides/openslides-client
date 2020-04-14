import { Injectable } from '@angular/core';

import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { ViewMotionVote } from 'app/site/motions/models/view-motion-vote';
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
export class MotionVoteRepositoryService extends BaseRepository<ViewMotionVote, MotionVote> {
    /**
     * @param DS DataStore access
     * @param dataSend Sending data
     * @param mapperService Map models to object
     * @param viewModelStoreService Access view models
     * @param translate Translate string
     * @param httpService make HTTP Requests
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionVote);
    }

    public getTitle = (viewMotionVote: object) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };
}
