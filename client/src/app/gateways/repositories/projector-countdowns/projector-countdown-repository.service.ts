import { inject, Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { ProjectorCountdown } from 'src/app/domain/models/projector/projector-countdown';
import { ViewProjectorCountdown } from 'src/app/site/pages/meetings/pages/projectors';

import { ServerTimePresenterService } from '../../presenter/server-time-presenter.service';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { ProjectorCountdownAction } from './projector-countdown.action';

@Injectable({
    providedIn: `root`
})
export class ProjectorCountdownRepositoryService extends BaseMeetingRelatedRepository<
    ViewProjectorCountdown,
    ProjectorCountdown
> {
    private serverTimePresenter = inject(ServerTimePresenterService);

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, ProjectorCountdown);
    }

    public getTitle = (viewProjectorCountdown: ViewProjectorCountdown) =>
        viewProjectorCountdown.description
            ? `${viewProjectorCountdown.title} (${viewProjectorCountdown.description})`
            : viewProjectorCountdown.title;

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Countdowns` : `Countdown`);

    public async create(payload: any): Promise<Identifiable> {
        return await this.sendActionToBackend(ProjectorCountdownAction.CREATE, payload);
    }

    public async update(update: Partial<ProjectorCountdown>, countdown: Identifiable): Promise<void> {
        const payload = {
            id: countdown.id,
            title: update.title,
            description: update.description,
            default_time: update.default_time,
            countdown_time: update.countdown_time,
            running: update.running
        };
        return await this.sendActionToBackend(ProjectorCountdownAction.UPDATE, payload);
    }

    public async delete(...countdowns: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = countdowns.map(countdown => ({ id: countdown.id }));
        return await this.sendBulkActionToBackend(ProjectorCountdownAction.DELETE, payload);
    }

    /**
     * Starts a countdown.
     *
     * @param countdown The countdown to start.
     */
    public async start(countdown: ViewProjectorCountdown): Promise<void> {
        const endTime = this.serverTimePresenter.getServertime() / 1000 + countdown.countdown_time;
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
        const endTime = countdown.countdown_time - this.serverTimePresenter.getServertime() / 1000;
        await this.update({ running: false, countdown_time: endTime }, countdown);
    }
}
