import { Injectable } from '@angular/core';

import { RelationDefinition } from 'app/core/definitions/relations';
import { MotionOption } from 'app/shared/models/motions/motion-option';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { ViewMotionVote } from 'app/site/motions/models/view-motion-vote';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

const MotionOptionRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        foreignIdKey: 'option_id',
        ownKey: 'votes',
        foreignViewModel: ViewMotionVote
    },
    {
        type: 'M2O',
        ownIdKey: 'poll_id',
        ownKey: 'poll',
        foreignViewModel: ViewMotionPoll
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
export class MotionOptionRepositoryService extends BaseRepository<ViewMotionOption, MotionOption, object> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionOption, MotionOptionRelations);
    }

    public getTitle = (titleInformation: object) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };
}
