import { Injectable } from '@angular/core';

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
}
