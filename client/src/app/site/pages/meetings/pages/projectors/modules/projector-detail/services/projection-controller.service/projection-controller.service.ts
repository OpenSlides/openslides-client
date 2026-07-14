import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { Projection } from '@app/domain/models/projector/projection';
import { ProjectionRepositoryService } from '@app/gateways/repositories/projections/projection-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjection } from '@app/site/pages/meetings/pages/projectors';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

@Injectable({ providedIn: 'root' })
export class ProjectionControllerService extends BaseMeetingControllerService<ViewProjection, Projection> {
    public constructor(
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
