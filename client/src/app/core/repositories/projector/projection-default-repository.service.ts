import { Injectable } from '@angular/core';

import { Identifiable } from 'app/shared/models/base/identifiable';
import { Projectiondefault } from 'app/shared/models/projector/projection-default';
import { ViewProjectiondefault } from 'app/site/projector/models/view-projectiondefault';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Manages all projection default instances.
 */
@Injectable({
    providedIn: 'root'
})
export class ProjectiondefaultRepositoryService extends BaseRepository<ViewProjectiondefault, Projectiondefault> {
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
        super(repositoryServiceCollector, Projectiondefault);
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Projectiondefaults' : 'Projectiondefault');
    };

    public getTitle = (viewProjectiondefault: ViewProjectiondefault) => {
        return this.translate.instant(viewProjectiondefault.display_name);
    };

    /**
     * Creation of projection defaults is not supported.
     */
    public async create(projectorData: Partial<Projectiondefault>): Promise<Identifiable> {
        throw new Error('Not supported');
    }

    /**
     * Deletion of projection defaults is not supported.
     */
    public async delete(viewProjectionDefault: ViewProjectiondefault): Promise<void> {
        throw new Error('Not supported');
    }
}
