import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { BasePollRepository } from 'app/core/repositories/base-poll-repository';
import { MotionPoll } from 'app/shared/models/motions/motion-poll';
import { UserVote, VoteValue } from 'app/shared/models/poll/base-vote';
import { MotionPollTitleInformation, ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollRepositoryService extends BasePollRepository<
    ViewMotionPoll,
    MotionPoll,
    MotionPollTitleInformation
> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        http: HttpService
    ) {
        super(repositoryServiceCollector, MotionPoll, http);
    }
    public getTitle = (titleInformation: MotionPollTitleInformation) => {
        return titleInformation.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Polls' : 'Poll');
    };

    public vote(vote: VoteValue, poll_id: number, userId?: number): Promise<void> {
        const requestData: UserVote = {
            data: vote,
            user_id: userId ?? undefined
        };
        return this.http.post(`/rest/motions/motion-poll/${poll_id}/vote/`, requestData);
    }
}
