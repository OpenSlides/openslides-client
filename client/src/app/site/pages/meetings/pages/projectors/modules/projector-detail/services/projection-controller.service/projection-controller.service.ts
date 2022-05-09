import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Projection } from 'src/app/domain/models/projector/projection';
import { ProjectionRepositoryService } from 'src/app/gateways/repositories/projections/projection-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjection } from 'src/app/site/pages/meetings/pages/projectors';

import { ProjectorDetailServiceModule } from '../projector-detail-service.module';

@Injectable({ providedIn: ProjectorDetailServiceModule })
export class ProjectionControllerService extends BaseMeetingControllerService<ViewProjection, Projection> {
    constructor(protected override repo: ProjectionRepositoryService) {
        super(Projection, repo);
    }

    public updateOption(projection: ViewProjection): Promise<void> {
        return this.repo.updateOption(projection);
    }

    public delete(...projections: Identifiable[]): Promise<void> {
        return this.repo.delete(...projections);
    }
}
