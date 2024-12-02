import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { Identifiable } from '../../../domain/interfaces';
import { StructureLevel } from '../../../domain/models/structure-levels/structure-level';
import { ViewStructureLevel } from '../../../site/pages/meetings/pages/participants/pages/structure-levels/view-models/view-structure-level';
import { Action } from '../../actions';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { StructureLevelAction } from './structure-level.action';

@Injectable({
    providedIn: `root`
})
export class StructureLevelRepositoryService extends BaseMeetingRelatedRepository<ViewStructureLevel, StructureLevel> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, StructureLevel);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? _(`Structure levels`) : _(`Structure level`));
    public getTitle = (viewModel: ViewStructureLevel): string => viewModel.name;

    public create(structureLevel: any, meeting_id: Id = this.activeMeetingId): Action<Identifiable> {
        const models = Array.isArray(structureLevel) ? structureLevel : [structureLevel];
        const payload: any[] = models.map(model => ({
            meeting_id: model.meeting_id || meeting_id,
            name: model.name,
            color: model.color
        }));
        return this.createAction(StructureLevelAction.CREATE, payload);
    }

    public update(viewModel: any | any[], id?: Id): Action<void> {
        const models = Array.isArray(viewModel) ? viewModel : [viewModel];
        const payload: any[] = models.map(model => ({
            id: model.id ?? id,
            name: model.name,
            color: model.color
        }));
        return this.createAction(StructureLevelAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Action<void> {
        const payload = ids.map(id => ({ id }));
        return this.createAction(StructureLevelAction.DELETE, payload);
    }
}
