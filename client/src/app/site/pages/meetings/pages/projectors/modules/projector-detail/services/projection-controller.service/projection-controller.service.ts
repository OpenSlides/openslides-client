import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { Projection } from 'src/app/domain/models/projector/projection';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ProjectionRepositoryService } from 'src/app/gateways/repositories/projections/projection-repository.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { ProjectorDetailServiceModule } from '../projector-detail-service.module';
import { ViewProjection } from 'src/app/site/pages/meetings/pages/projectors';

@Injectable({ providedIn: ProjectorDetailServiceModule })
export class ProjectionControllerService extends BaseMeetingControllerService<ViewProjection, Projection> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ProjectionRepositoryService
    ) {
        super(controllerServiceCollector, Projection, repo);
    }

    public updateOption(projection: ViewProjection): Promise<void> {
        return this.repo.updateOption(projection);
    }

    public delete(...projections: Identifiable[]): Promise<void> {
        return this.repo.delete(...projections);
    }
}
