import { Injectable } from '@angular/core';

import { RelationDefinition } from 'app/core/definitions/relations';
import { AssignmentOption } from 'app/shared/models/assignments/assignment-option';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { ViewAssignmentVote } from 'app/site/assignments/models/view-assignment-vote';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

const AssignmentOptionRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        foreignIdKey: 'option_id',
        ownKey: 'votes',
        foreignViewModel: ViewAssignmentVote
    },
    {
        type: 'M2O',
        ownIdKey: 'poll_id',
        ownKey: 'poll',
        foreignViewModel: ViewAssignmentPoll
    },
    {
        type: 'M2O',
        ownIdKey: 'user_id',
        ownKey: 'user',
        foreignViewModel: ViewUser
    }
];

/**
 * Repository Service for Options.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentOptionRepositoryService extends BaseRepository<ViewAssignmentOption, AssignmentOption, object> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentOption, AssignmentOptionRelations);
    }

    public getTitle = (titleInformation: object) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };
}
