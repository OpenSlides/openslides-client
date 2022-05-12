import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { ProjectorMessage } from 'src/app/domain/models/projector/projector-message';
import { ViewProjectorMessage } from 'src/app/site/pages/meetings/pages/projectors';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { ProjectorMessageAction } from './projector-message.action';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: 'root'
})
export class ProjectorMessageRepositoryService extends BaseMeetingRelatedRepository<
    ViewProjectorMessage,
    ProjectorMessage
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, ProjectorMessage);
    }
    public getTitle = (viewProjectorMessage: ViewProjectorMessage) => this.getVerboseName();

    public getVerboseName = (plural: boolean = false) => _(plural ? `Messages` : `Message`);

    public override getFieldsets(): Fieldsets<ProjectorMessage> {
        return {
            [DEFAULT_FIELDSET]: [`message`]
        };
    }

    public async create(payload: any): Promise<Identifiable> {
        return await this.sendActionToBackend(ProjectorMessageAction.CREATE, payload);
    }

    public async update(update: Partial<ProjectorMessage>, projectorMessage: Identifiable): Promise<void> {
        const payload = {
            id: projectorMessage.id,
            message: update.message
        };
        return await this.sendActionToBackend(ProjectorMessageAction.UPDATE, payload);
    }

    public async delete(...messages: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = messages.map(message => ({ id: message.id }));
        return await this.sendBulkActionToBackend(ProjectorMessageAction.DELETE, payload);
    }
}
