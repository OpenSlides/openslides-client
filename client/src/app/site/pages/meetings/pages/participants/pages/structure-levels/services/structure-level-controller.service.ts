import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { StructureLevel } from '@app/domain/models/structure-levels/structure-level';
import { StructureLevelRepositoryService } from '@app/gateways/repositories/structure-levels';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { Observable } from 'rxjs';

import { ViewStructureLevel } from '../view-models/view-structure-level';

@Service()
export class StructureLevelControllerService extends BaseMeetingControllerService<ViewStructureLevel, StructureLevel> {
    protected override repo: StructureLevelRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repoForSuper = inject(StructureLevelRepositoryService);
        super(controllerServiceCollector, StructureLevel, repoForSuper);
        this.repo = repoForSuper;
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
