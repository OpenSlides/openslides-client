import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { StructureLevelListOfSpeakers } from 'src/app/domain/models/structure-levels/structure-level-list-of-speakers';
import { ViewStructureLevelListOfSpeakers } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

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

    public getVerboseName = (): string => _(`StructureLevelListOfSpeakers`);
    public getTitle = (): string => ``;
}
