import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Subdivision } from 'src/app/domain/models/subdivisions/subdivision';
import { SubdivisionRepositoryService } from 'src/app/gateways/repositories/subdivisions';
import { BaseController } from 'src/app/site/base/base-controller';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

import { ViewSubdivision } from '../view-models/view-subdivision';

@Injectable({
    providedIn: `root`
})
export class SubdivisionControlService extends BaseController<ViewSubdivision, Subdivision> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: SubdivisionRepositoryService
    ) {
        super(controllerServiceCollector, Subdivision, repo);
    }

    public create(...subdivisons: Partial<Subdivision>[]): Promise<Identifiable[]> {
        return this.repo.create(...subdivisons);
    }

    public update(update: Partial<Subdivision>, subdivison: Identifiable): Promise<void> {
        return this.repo.update(update, subdivison);
    }

    public delete(...subdivisons: Identifiable[]): Promise<void> {
        return this.repo.delete(...subdivisons);
    }
}
