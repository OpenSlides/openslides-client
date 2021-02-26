import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ProjectorCountdownAction } from 'app/core/actions/projector-countdown-action';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { ProjectorCountdownRepositoryService } from 'app/core/repositories/projector/projector-countdown-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ProjectionDialogService } from 'app/core/ui-services/projection-dialog.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ProjectorCountdown } from 'app/shared/models/projector/projector-countdown';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { CountdownDialogComponent, CountdownDialogData } from '../countdown-dialog/countdown-dialog.component';
import { ViewProjector } from '../../models/view-projector';
import { ViewProjectorCountdown } from '../../models/view-projector-countdown';

/**
 *
 */
@Component({
    selector: 'os-countdown-controls',
    templateUrl: './countdown-controls.component.html',
    styleUrls: ['./countdown-controls.component.scss']
})
export class CountdownControlsComponent extends BaseComponent {
    /**
     * Countdown as input
     */
    @Input()
    public countdown: ViewProjectorCountdown;

    /**
     * Pre defined projection target (if any)
     */
    @Input()
    public projector: ViewProjector;

    /**
     * The time in seconds to make the countdown orange, is the countdown is below this value.
     */
    public warningTime: number;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: ProjectorCountdownRepositoryService,
        private meetingSettingsService: MeetingSettingsService,
        private promptService: PromptService,
        private projectionDialogService: ProjectionDialogService,
        private durationService: DurationService,
        private dialog: MatDialog,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);

        this.meetingSettingsService
            .get('projector_countdown_warning_time')
            .subscribe(time => (this.warningTime = time));
    }

    /**
     * Start the countdown
     */
    public start(event: Event): void {
        event.stopPropagation();
        this.repo.start(this.countdown);
    }

    /**
     * Pause the countdown
     */
    public pause(event: Event): void {
        event.stopPropagation();
        this.repo.pause(this.countdown);
    }

    /**
     * Stop the countdown
     */
    public stop(event: Event): void {
        event.stopPropagation();
        this.repo.stop(this.countdown);
    }

    /**
     * One can stop the countdown, if it is running or not resetted.
     */
    public canStop(): boolean {
        return this.countdown.running || this.countdown.countdown_time !== this.countdown.default_time;
    }

    /**
     * Fires an edit event
     */
    public onEdit(): void {
        const countdownData: CountdownDialogData = {
            title: this.countdown.title,
            description: this.countdown.description,
            duration: this.durationService.durationToString(this.countdown.default_time, 'm')
        };

        const dialogRef = this.dialog.open(CountdownDialogComponent, {
            data: countdownData,
            ...infoDialogSettings
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const defaultTime = this.durationService.stringToDuration(result.duration, 'm');

                const update: Partial<ProjectorCountdown> = {
                    title: result.title,
                    description: result.description,
                    default_time: defaultTime
                };

                if (!this.countdown.running) {
                    update.countdown_time = defaultTime;
                }

                this.repo.update(update, this.countdown);
            }
        });
    }

    /**
     * Brings the projection dialog
     */
    public onBringDialog(): void {
        this.projectionDialogService.openProjectDialogFor(this.countdown.getProjectionBuildDescriptor());
    }

    /**
     * On delete button
     */
    public async onDelete(): Promise<void> {
        const content =
            this.translate.instant('Delete countdown') + ` ${this.translate.instant(this.countdown.title)}?`;
        if (await this.promptService.open('Are you sure?', content)) {
            this.repo.delete(this.countdown);
        }
    }
}
