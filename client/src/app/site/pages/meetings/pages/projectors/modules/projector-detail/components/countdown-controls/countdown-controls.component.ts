import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProjectorCountdown } from 'src/app/domain/models/projector/projector-countdown';
import { ProjectionDialogService } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projection-dialog/services/projection-dialog.service';
import { ViewProjector, ViewProjectorCountdown } from 'src/app/site/pages/meetings/pages/projectors';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { DurationService } from 'src/app/site/services/duration.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ProjectorCountdownDialogService } from '../../../../components/projector-countdown-dialog/services/projector-countdown-dialog.service';
import { ProjectorCountdownControllerService } from '../../services/projector-countdown-controller.service';

@Component({
    selector: `os-countdown-controls`,
    templateUrl: `./countdown-controls.component.html`,
    styleUrls: [`./countdown-controls.component.scss`]
})
export class CountdownControlsComponent {
    /**
     * Countdown/Timer as input
     */
    @Input()
    public countdown!: ViewProjectorCountdown;

    /**
     * Pre defined projection target (if any)
     */
    @Input()
    public projector!: ViewProjector;

    /**
     * Determines if the underlying countdown is used for either a list of speakers or a poll.
     * If so, the countdown is not supposed to be deleted.
     */
    public get isFixedCountdown(): boolean {
        return (
            !!this.countdown?.used_as_list_of_speakers_countdown_meeting_id ||
            !!this.countdown?.used_as_poll_countdown_meeting_id
        );
    }

    /**
     * The time in seconds to make the countdown orange, is the countdown is below this value.
     */
    protected warningTime!: number;

    public constructor(
        private translate: TranslateService,
        private repo: ProjectorCountdownControllerService,
        private meetingSettingsService: MeetingSettingsService,
        private promptService: PromptService,
        private projectionDialogService: ProjectionDialogService,
        private durationService: DurationService,
        private dialog: ProjectorCountdownDialogService
    ) {
        this.meetingSettingsService
            .get(`projector_countdown_warning_time`)
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
    public async onEdit(): Promise<void> {
        const dialogRef = await this.dialog.open({
            title: this.countdown.title,
            description: this.countdown.description,
            duration: this.durationService.durationToString(this.countdown.default_time, `m`)
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const defaultTime = this.durationService.stringToDuration(result.duration, `m`);

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
        const title = this.translate.instant(`Are you sure you want to delete this countdown?`);
        const content = this.countdown.title;

        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.countdown);
        }
    }
}
