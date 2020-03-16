import { Injectable } from '@angular/core';

import { Identifiable } from 'app/shared/models/base/identifiable';
import { ProjectionDefault } from 'app/shared/models/core/projection-default';
import {
    ProjectionDefaultTitleInformation,
    ViewProjectionDefault
} from 'app/site/projector/models/view-projection-default';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Manages all projection default instances.
 */
@Injectable({
    providedIn: 'root'
})
export class ProjectionDefaultRepositoryService extends BaseRepository<
    ViewProjectionDefault,
    ProjectionDefault,
    ProjectionDefaultTitleInformation
> {
    /**
     * Constructor calls the parent constructor
     *
     * @param DS The DataStore
     * @param dataSend sending changed objects
     * @param mapperService Maps collection strings to classes
     * @param viewModelStoreService
     * @param translate
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ProjectionDefault);
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Projectiondefaults' : 'Projectiondefault');
    };

    public getTitle = (titleInformation: ProjectionDefaultTitleInformation) => {
        return this.translate.instant(titleInformation.display_name);
    };

    /**
     * Creation of projection defaults is not supported.
     */
    public async create(projectorData: Partial<ProjectionDefault>): Promise<Identifiable> {
        throw new Error('Not supported');
    }

    /**
     * Deletion of projection defaults is not supported.
     */
    public async delete(viewProjectionDefault: ViewProjectionDefault): Promise<void> {
        throw new Error('Not supported');
    }
}
