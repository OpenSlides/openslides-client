import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { StructureLevelListOfSpeakers } from '@app/domain/models/structure-levels/structure-level-list-of-speakers';
import { StructureLevelListOfSpeakersAction } from '@app/gateways/repositories/structure-level-list-of-speakers/structure-level-list-of-speakers.action';
import { ViewStructureLevelListOfSpeakers } from '@app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class StructureLevelListOfSpeakersRepositoryService extends BaseMeetingRelatedRepository<
    ViewStructureLevelListOfSpeakers,
    StructureLevelListOfSpeakers
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, StructureLevelListOfSpeakers);
    }

    public getVerboseName = (): string => `StructureLevelListOfSpeakers`;
    public getTitle = (): string => ``;

    public async create(payload: any[]): Promise<void | void[]> {
        return this.createAction(StructureLevelListOfSpeakersAction.CREATE, payload).resolve();
    }

    public async update(payload: any[]): Promise<void | void[]> {
        return this.createAction(StructureLevelListOfSpeakersAction.UPDATE, payload).resolve();
    }

    public async delete(payload: Identifiable[]): Promise<void | void[]> {
        return this.createAction(StructureLevelListOfSpeakersAction.DELETE, payload).resolve();
    }

    public async add_time(payload: Identifiable[]): Promise<void | void[]> {
        return this.createAction(StructureLevelListOfSpeakersAction.ADD_TIME, payload).resolve();
    }
}
