import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { ProjectorCountdown } from '@app/domain/models/projector/projector-countdown';
import { ProjectorCountdownRepositoryService } from '@app/gateways/repositories/projector-countdowns/projector-countdown-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjectorCountdown } from '@app/site/pages/meetings/pages/projectors';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

@Service()
export class ProjectorCountdownControllerService extends BaseMeetingControllerService<
    ViewProjectorCountdown,
    ProjectorCountdown
> {
    protected override repo: ProjectorCountdownRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(ProjectorCountdownRepositoryService);
        super(controllerServiceCollector, ProjectorCountdown, repo);
    }

    public create(payload: any): Promise<Identifiable> {
        return this.repo.create(payload);
    }

    public update(update: any, countdown: Identifiable): Promise<void> {
        return this.repo.update(update, countdown);
    }

    public delete(...countdowns: Identifiable[]): Promise<void> {
        return this.repo.delete(...countdowns);
    }

    public start(countdown: ViewProjectorCountdown): Promise<void> {
        return this.repo.start(countdown);
    }

    public stop(countdown: ViewProjectorCountdown): Promise<void> {
        return this.repo.stop(countdown);
    }

    public pause(countdown: ViewProjectorCountdown): Promise<void> {
        return this.repo.pause(countdown);
    }
}
