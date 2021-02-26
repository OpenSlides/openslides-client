import { Injectable } from '@angular/core';

import { ProjectionAction } from 'app/core/actions/projection-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Projection } from 'app/shared/models/projector/projection';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ProjectionRepositoryService extends BaseRepositoryWithActiveMeeting<ViewProjection, Projection> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Projection);
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Projections' : 'Projection');
    };

    public getTitle = (viewProjection: ViewProjection) => {
        return 'Projection';
    };

    public getFieldsets(): Fieldsets<Projection> {
        return {
            [DEFAULT_FIELDSET]: ['stable', 'type', 'options', 'weight']
        };
    }

    /**
     * Deletes a projection. It can only be deleted, if It is a current or preview projection.
     */
    public async delete(projection: ViewProjection): Promise<void> {
        return await this.deleteMultiple([projection]);
    }

    /**
     * Deletes multiple projections. They can only be deleted, if they are current or preview projections.
     */
    public async deleteMultiple(projections: ViewProjection[]): Promise<void> {
        return await this.sendBulkActionToBackend(
            ProjectionAction.DELETE,
            projections.map(projection => ({ id: projection.id }))
        );
    }
}
