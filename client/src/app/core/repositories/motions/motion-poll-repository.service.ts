import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { RelationDefinition } from 'app/core/definitions/relations';
import { BasePollRepository } from 'app/core/repositories/base-poll-repository';
import { VotingService } from 'app/core/ui-services/voting.service';
import { MotionPoll } from 'app/shared/models/motions/motion-poll';
import { UserVote, VoteValue } from 'app/shared/models/poll/base-vote';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { MotionPollTitleInformation, ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { RepositoryServiceCollector } from '../repository-service-collector';

const MotionPollRelations: RelationDefinition[] = [
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
        foreignViewModel: ViewMotionOption
    },
    {
        type: 'M2O',
        ownIdKey: 'motion_id',
        ownKey: 'motion',
        foreignViewModel: ViewMotion
    },
    {
        type: 'M2M',
        ownIdKey: 'voted_id',
        ownKey: 'voted',
        foreignViewModel: ViewUser
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
export class MotionPollRepositoryService extends BasePollRepository<
    ViewMotionPoll,
    MotionPoll,
    MotionPollTitleInformation
> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        http: HttpService
    ) {
        super(repositoryServiceCollector, MotionPoll, MotionPollRelations, {}, http);
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
