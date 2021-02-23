import { Injectable } from '@angular/core';

import { ProjectorCountdownAction } from 'app/core/actions/projector-countdown-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ServertimeService } from 'app/core/core-services/servertime.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ProjectorCountdown } from 'app/shared/models/projector/projector-countdown';
import { ViewProjectorCountdown } from 'app/site/projector/models/view-projector-countdown';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class ProjectorCountdownRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewProjectorCountdown,
    ProjectorCountdown
> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private servertimeService: ServertimeService
    ) {
        super(repositoryServiceCollector, ProjectorCountdown);
    }

    public getTitle = (viewProjectorCountdown: ViewProjectorCountdown) => {
        return viewProjectorCountdown.description
            ? `${viewProjectorCountdown.title} (${viewProjectorCountdown.description})`
            : viewProjectorCountdown.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Countdowns' : 'Countdown');
    };

    public getFieldsets(): Fieldsets<ProjectorCountdown> {
        return {
            [DEFAULT_FIELDSET]: ['title', 'description', 'default_time', 'countdown_time', 'running']
        };
    }

    public async create(payload: ProjectorCountdownAction.CreatePayload): Promise<Identifiable> {
        return await this.sendActionToBackend(ProjectorCountdownAction.CREATE, payload);
    }

    public async update(
        update: Partial<ProjectorCountdown>,
        projectorCountdown: ViewProjectorCountdown
    ): Promise<void> {
        const payload: ProjectorCountdownAction.UpdatePayload = {
            id: projectorCountdown.id,
            title: update.title,
            description: update.description,
            default_time: update.default_time,
            countdown_time: update.countdown_time,
            running: update.running
        };
        return await this.sendActionToBackend(ProjectorCountdownAction.UPDATE, payload);
    }

    public async delete(projectorCountdown: ViewProjectorCountdown): Promise<void> {
        const payload: ProjectorCountdownAction.DeletePayload = {
            id: projectorCountdown.id
        };
        return await this.sendActionToBackend(ProjectorCountdownAction.DELETE, payload);
    }

    /**
     * Starts a countdown.
     *
     * @param countdown The countdown to start.
     */
    public async start(countdown: ViewProjectorCountdown): Promise<void> {
        const endTime = this.servertimeService.getServertime() / 1000 + countdown.countdown_time;
        await this.update({ running: true, countdown_time: endTime }, countdown);
    }

    /**
     * Stops (former `reset`) a countdown. Sets the countdown time to the default time. If
     * this should not happen, use `pause()`.
     *
     * @param countdown The countdown to stop.
     */
    public async stop(countdown: ViewProjectorCountdown): Promise<void> {
        await this.update({ running: false, countdown_time: countdown.default_time }, countdown);
    }

    /**
     * Pauses the countdown. The remaining time will stay.
     *
     * @param countdown The countdown to pause.
     */
    public async pause(countdown: ViewProjectorCountdown): Promise<void> {
        const endTime = countdown.countdown_time - this.servertimeService.getServertime() / 1000;
        await this.update({ running: false, countdown_time: endTime }, countdown);
    }
}
