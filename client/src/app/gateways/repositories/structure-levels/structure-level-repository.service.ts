import { Injectable } from '@angular/core';

import { Identifiable } from '../../../domain/interfaces';
import { StructureLevel } from '../../../domain/models/structure-levels/structure-level';
import { ViewStructureLevel } from '../../../site/pages/meetings/pages/participants/pages/structure-levels/view-models/view-structure-level';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { StructureLevelAction } from './structure-level.action';

@Injectable({
    providedIn: `root`
})
export class StructureLevelRepositoryService extends BaseRepository<ViewStructureLevel, StructureLevel> {
    public constructor(serviceCollector: RepositoryServiceCollectorService) {
        super(serviceCollector, StructureLevel);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `StructureLevels` : `StructureLevel`);
    public getTitle = (viewModel: ViewStructureLevel): string => viewModel.name;

    public async create(...structureLevels: Partial<StructureLevel>[]): Promise<Identifiable[]> {
        const payload = structureLevels.map(structureLevel => ({
            name: structureLevel.name,
            color: structureLevel.color,
            allow_additional_time: structureLevel.allow_additional_time
        }));
        return this.sendBulkActionToBackend(StructureLevelAction.CREATE, payload);
    }

    public async update(update: Partial<StructureLevel>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            color: update.color,
            allow_additional_time: update.allow_additional_time
        };
        return this.sendActionToBackend(StructureLevelAction.UPDATE, payload);
    }

    public async delete(...structureLevels: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = structureLevels.map(structureLevel => ({ id: structureLevel.id }));
        return this.sendBulkActionToBackend(StructureLevelAction.DELETE, payload);
    }
}
