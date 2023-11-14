import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { StructureLevel } from 'src/app/domain/models/structure-levels/structure-level';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseController } from 'src/app/site/base/base-controller';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

import { ViewStructureLevel } from '../view-models/view-structure-level';

@Injectable({
    providedIn: `root`
})
export class StructureLevelControlService extends BaseController<ViewStructureLevel, StructureLevel> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: StructureLevelRepositoryService
    ) {
        super(controllerServiceCollector, StructureLevel, repo);
    }

    public create(...subdivisons: Partial<StructureLevel>[]): Promise<Identifiable[]> {
        return this.repo.create(...subdivisons);
    }

    public update(update: Partial<StructureLevel>, subdivison: Identifiable): Promise<void> {
        return this.repo.update(update, subdivison);
    }

    public delete(...subdivisons: Identifiable[]): Promise<void> {
        return this.repo.delete(...subdivisons);
    }
}
