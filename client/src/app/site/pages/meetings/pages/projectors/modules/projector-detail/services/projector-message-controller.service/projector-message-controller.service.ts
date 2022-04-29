import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ProjectorMessage } from 'src/app/domain/models/projector/projector-message';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ProjectorMessageRepositoryService } from 'src/app/gateways/repositories/projector-messages/projector-message-repository.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { ProjectorDetailServiceModule } from '../projector-detail-service.module';
import { ViewProjectorMessage } from 'src/app/site/pages/meetings/pages/projectors';

@Injectable({ providedIn: ProjectorDetailServiceModule })
export class ProjectorMessageControllerService extends BaseMeetingControllerService<
    ViewProjectorMessage,
    ProjectorMessage
> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ProjectorMessageRepositoryService
    ) {
        super(controllerServiceCollector, ProjectorMessage, repo);
    }

    public create(payload: any): Promise<Identifiable> {
        return this.repo.create(payload);
    }

    public update(update: any, message: Identifiable): Promise<void> {
        return this.repo.update(update, message);
    }

    public delete(...messages: Identifiable[]): Promise<void> {
        return this.repo.delete(...messages);
    }
}
