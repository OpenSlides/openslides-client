import { Injectable } from '@angular/core';

import { ProjectorMessage } from 'app/shared/models/projector/projector-message';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ProjectorMessageRepositoryService extends MeetingModelBaseRepository<
    ViewProjectorMessage,
    ProjectorMessage
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ProjectorMessage);
    }

    public getTitle = (viewProjectorMessage: ViewProjectorMessage) => {
        return this.getVerboseName();
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Messages' : 'Message');
    };
}
