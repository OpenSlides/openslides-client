import { Injectable } from '@angular/core';

import { Identifiable } from 'app/shared/models/base/identifiable';
import { Projectiondefault } from 'app/shared/models/projector/projection-default';
import { ViewProjectiondefault } from 'app/site/projector/models/view-projectiondefault';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Manages all projection default instances.
 */
@Injectable({
    providedIn: 'root'
})
export class ProjectiondefaultRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewProjectiondefault,
    Projectiondefault
> {
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
