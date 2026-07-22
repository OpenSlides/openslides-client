import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { ProjectorMessage } from '@app/domain/models/projector/projector-message';
import { ProjectorMessageRepositoryService } from '@app/gateways/repositories/projector-messages/projector-message-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjectorMessage } from '@app/site/pages/meetings/pages/projectors';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

@Service()
export class ProjectorMessageControllerService extends BaseMeetingControllerService<
    ViewProjectorMessage,
    ProjectorMessage
> {
    protected override repo: ProjectorMessageRepositoryService;
    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(ProjectorMessageRepositoryService);
        super(controllerServiceCollector, ProjectorMessage, repo);
        this.repo = repo;
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
