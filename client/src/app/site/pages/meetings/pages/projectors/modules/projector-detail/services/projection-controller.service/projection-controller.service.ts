import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { Projection } from '@app/domain/models/projector/projection';
import { ProjectionRepositoryService } from '@app/gateways/repositories/projections/projection-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjection } from '@app/site/pages/meetings/pages/projectors';

@Service()
export class ProjectionControllerService extends BaseMeetingControllerService<ViewProjection, Projection> {
    protected repo: ProjectionRepositoryService = inject(ProjectionRepositoryService);

    public baseModelCtor = Projection;

    public updateOption(projection: ViewProjection): Promise<void> {
        return this.repo.updateOption(projection);
    }

    public delete(...projections: Identifiable[]): Promise<void> {
        return this.repo.delete(...projections);
    }
}
