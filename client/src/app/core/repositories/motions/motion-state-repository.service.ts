import { Injectable } from '@angular/core';

import { MotionState } from 'app/shared/models/motions/motion-state';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for States
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionStateRepositoryService extends MeetingModelBaseRepository<ViewMotionState, MotionState> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionState);
    }

    public getTitle = (viewMotionState: ViewMotionState) => {
        return viewMotionState.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Workflows' : 'Workflow');
    };
}
