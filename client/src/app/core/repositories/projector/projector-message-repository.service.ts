import { Injectable } from '@angular/core';

import { ProjectorMessageAction } from 'app/core/actions/projector-message-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ProjectorMessage } from 'app/shared/models/projector/projector-message';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ProjectorMessageRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewProjectorMessage,
    ProjectorMessage
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ProjectorMessage);
    }

    public getTitle = (viewProjectorMessage: ViewProjectorMessage) => this.getVerboseName();

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? 'Messages' : 'Message');

    public getFieldsets(): Fieldsets<ProjectorMessage> {
        return {
            [DEFAULT_FIELDSET]: ['message']
        };
    }

    public async create(payload: ProjectorMessageAction.CreatePayload): Promise<Identifiable> {
        return await this.sendActionToBackend(ProjectorMessageAction.CREATE, payload);
    }

    public async update(update: Partial<ProjectorMessage>, projectorMessage: ViewProjectorMessage): Promise<void> {
        const payload: ProjectorMessageAction.UpdatePayload = {
            id: projectorMessage.id,
            message: update.message
        };
        return await this.sendActionToBackend(ProjectorMessageAction.UPDATE, payload);
    }

    public async delete(projectorMessage: ViewProjectorMessage): Promise<void> {
        const payload: ProjectorMessageAction.DeletePayload = {
            id: projectorMessage.id
        };
        return await this.sendActionToBackend(ProjectorMessageAction.DELETE, payload);
    }
}
