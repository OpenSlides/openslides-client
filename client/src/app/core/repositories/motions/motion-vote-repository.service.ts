import { Injectable } from '@angular/core';

import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { ViewMotionVote } from 'app/site/motions/models/view-motion-vote';
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
export class MotionVoteRepositoryService extends BaseRepositoryWithActiveMeeting<ViewMotionVote, MotionVote> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionVote);
    }

    public getTitle = (viewMotionVote: object) => {
        return 'Vote';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Votes' : 'Vote');
    };

    public getFieldsets(): Fieldsets<MotionVote> {
        return {}; // TODO
    }
}
