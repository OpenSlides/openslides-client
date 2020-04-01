import { Injectable } from '@angular/core';

import { MotionState } from 'app/shared/models/motions/motion-state';
import { StateTitleInformation, ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { WorkflowTitleInformation } from 'app/site/motions/models/view-motion-workflow';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for States
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link DataSendService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionStateRepositoryService extends BaseRepository<ViewMotionState, MotionState, StateTitleInformation> {
    /**
     * Creates a WorkflowRepository
     * Converts existing and incoming workflow to ViewWorkflows
     *
     * @param DS Accessing the data store
     * @param mapperService mapping models
     * @param dataSend sending data to the server
     * @param httpService HttpService
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionState);
    }

    public getTitle = (titleInformation: WorkflowTitleInformation) => {
        return titleInformation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Workflows' : 'Workflow');
    };
}
