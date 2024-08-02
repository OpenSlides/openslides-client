import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { ProjectorCountdown } from 'src/app/domain/models/projector/projector-countdown';
import { ProjectorCountdownRepositoryService } from 'src/app/gateways/repositories/projector-countdowns/projector-countdown-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewProjectorCountdown } from 'src/app/site/pages/meetings/pages/projectors';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ProjectorDetailServiceModule } from '../projector-detail-service.module';

@Injectable({ providedIn: ProjectorDetailServiceModule })
export class ProjectorCountdownControllerService extends BaseMeetingControllerService<
    ViewProjectorCountdown,
    ProjectorCountdown
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ProjectorCountdownRepositoryService
    ) {
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
