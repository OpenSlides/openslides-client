import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Countdown data for the form
 */
export interface CountdownData {
    title: string;
    description: string;
    duration: string;
    count?: number;
}

/**
 * Dialog component for countdowns
 */
@Component({
    selector: 'os-countdown-dialog',
    templateUrl: './countdown-dialog.component.html',
    styleUrls: ['./countdown-dialog.component.scss']
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

    /**
     * Constructor
     *
     * @param title Title service. Required by parent
     * @param matSnackBar Required by parent
     * @param organisationSettingsService Read out config variables
     * @param translate Required by parent
     * @param formBuilder To build the form
     * @param durationService Converts duration numbers to string
     * @param data The mat dialog data, contains the values to display (if any)
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        organisationSettingsService: OrganisationSettingsService,
        private formBuilder: FormBuilder,
        private durationService: DurationService,
        @Inject(MAT_DIALOG_DATA) public data: CountdownData
    ) {
        super(componentServiceCollector);
        this.defaultTime = organisationSettingsService.instant<number>('projector_default_countdown');
    }

    /**
     * Init. Creates the form
     */
    public ngOnInit(): void {
        const time = this.data.duration || this.durationService.durationToString(this.defaultTime, 'm');
        const title = this.data.title || `${this.translate.instant('Countdown')} ${this.data.count + 1}`;

        this.countdownForm = this.formBuilder.group({
            title: [title, Validators.required],
            description: [this.data.description],
            // TODO: custom form validation. This needs to be a valid minute duration
            duration: [time, Validators.required]
        });
    }
}
