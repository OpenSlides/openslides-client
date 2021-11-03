import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Countdown data for the form
 */
export interface CountdownDialogData {
    title: string;
    description: string;
    duration: string;
    count?: number;
}

/**
 * Dialog component for countdowns
 */
@Component({
    selector: `os-countdown-dialog`,
    templateUrl: `./countdown-dialog.component.html`,
    styleUrls: [`./countdown-dialog.component.scss`]
})
export class CountdownDialogComponent extends BaseComponent implements OnInit {
    /**
     * The form data
     */
    public countdownForm: FormGroup;

    /**
     * Holds the default time which was set in the config
     */
    private defaultTime: number;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        meetingSettingsService: MeetingSettingsService,
        private formBuilder: FormBuilder,
        private durationService: DurationService,
        @Inject(MAT_DIALOG_DATA) public data: CountdownDialogData
    ) {
        super(componentServiceCollector, translate);
        this.defaultTime = meetingSettingsService.instant(`projector_countdown_warning_time`);
    }

    /**
     * Init. Creates the form
     */
    public ngOnInit(): void {
        const time = this.data.duration || this.durationService.durationToString(this.defaultTime, `m`);
        const title = this.data.title || `${this.translate.instant(`Countdown`)} ${this.data.count + 1}`;

        this.countdownForm = this.formBuilder.group({
            title: [title, Validators.required],
            description: [this.data.description],
            // TODO: custom form validation. This needs to be a valid minute duration
            duration: [time, Validators.required]
        });
    }
}
