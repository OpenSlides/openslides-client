import { Component, EventEmitter, Input, Output } from '@angular/core';

import { StorageService } from 'app/core/core-services/storage.service';
import { CountdownRepositoryService } from 'app/core/repositories/projector/countdown-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { ProjectionDialogService } from 'app/core/ui-services/projection-dialog.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { Projector } from 'app/shared/models/core/projector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewCountdown } from '../../models/view-countdown';

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
    public countdown: ViewCountdown;

    /**
     * Edit event
     */
    @Output()
    public editEvent = new EventEmitter<ViewCountdown>();

    /**
     * Pre defined projection target (if any)
     */
    @Input()
    public projector: Projector;

    /**
     * The time in seconds to make the countdown orange, is the countdown is below this value.
     */
    public warningTime: number;

    /**
     * The key to storage.
     */
    private storageKey = 'projectorElementOptions';

    /**
     * Constructor
     *
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param repo
     * @param organisationSettingsService
     * @param promptService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: CountdownRepositoryService,
        private organisationSettingsService: OrganisationSettingsService,
        private promptService: PromptService,
        private projectionDialogService: ProjectionDialogService,
        private storage: StorageService
    ) {
        super(componentServiceCollector);

        this.organisationSettingsService
            .get<number>('agenda_countdown_warning_time')
            .subscribe(time => (this.warningTime = time));
    }

    /**
     * Start the countdown
     */
    public start(event: Event): void {
        event.stopPropagation();
        this.repo.start(this.countdown).catch(this.raiseError);
    }

    /**
     * Pause the countdown
     */
    public pause(event: Event): void {
        event.stopPropagation();
        this.repo.pause(this.countdown).catch(this.raiseError);
    }

    /**
     * Stop the countdown
     */
    public stop(event: Event): void {
        event.stopPropagation();
        this.repo.stop(this.countdown).catch(this.raiseError);
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
        this.editEvent.next(this.countdown);
    }

    /**
     * Brings the projection dialog
     */
    public onBringDialog(): void {
        this.projectionDialogService
            .openProjectDialogFor(this.countdown)
            .then(options => this.storeSettings(options), null);
    }

    /**
     * On delete button
     */
    public async onDelete(): Promise<void> {
        const content =
            this.translate.instant('Delete countdown') + ` ${this.translate.instant(this.countdown.title)}?`;
        if (await this.promptService.open('Are you sure?', content)) {
            this.repo.delete(this.countdown).then(() => {}, this.raiseError);
        }
    }

    /**
     * Stores the options for a projector in the local-storage.
     *
     * @param element The configured options for projector
     */
    private storeSettings(element: object): void {
        this.storage.set(this.storageKey, element);
    }
}
