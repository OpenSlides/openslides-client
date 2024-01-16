import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { StructureLevel } from 'src/app/domain/models/structure-levels/structure-level';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewStructureLevel } from '../view-models/view-structure-level';

@Injectable({
    providedIn: `root`
})
export class StructureLevelControllerService extends BaseMeetingControllerService<ViewStructureLevel, StructureLevel> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: StructureLevelRepositoryService
    ) {
        super(controllerServiceCollector, StructureLevel, repo);
    }

    public create(...structureLevels: Partial<StructureLevel>[]): Promise<Identifiable[] | void> {
        return this.repo.create(structureLevels).resolve();
    }

    public update(update: Partial<StructureLevel>, structureLevelId: Id): Promise<void | void[]> {
        return this.repo.update(update, structureLevelId).resolve();
    }

    public delete(...structureLevelIds: Id[]): Promise<void | void[]> {
        return this.repo.delete(...structureLevelIds).resolve();
    }

    /**
     * Returns an Observable for all structure levels.
     */
    public getViewModelListStructureLevelObservable(): Observable<ViewStructureLevel[]> {
        return this.getViewModelListObservable();
    }

    public getViewModelListStructureLevel(): ViewStructureLevel[] {
        return this.getViewModelList();
    }
}
