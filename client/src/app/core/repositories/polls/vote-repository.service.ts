import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ViewVote } from 'app/shared/models/poll/view-vote';
import { Vote } from 'app/shared/models/poll/vote';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class VoteRepositoryService extends BaseRepositoryWithActiveMeeting<ViewVote, Vote> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Vote);
    }

    public getTitle = (viewVote: object) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };

    public getFieldsets(): Fieldsets<Vote> {
        const detail: (keyof Vote)[] = ['delegated_user_id', 'option_id', 'user_id', 'value', 'weight', 'user_token'];
        return {
            [DEFAULT_FIELDSET]: detail
        };
    }
}
