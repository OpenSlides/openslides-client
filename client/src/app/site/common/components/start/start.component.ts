import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Interface describes the keys for the fields at start-component.
 */
interface IStartContent {
    welcome_title: string;
    welcome_text: string;
}

/**
 * The start component. Greeting page for OpenSlides
 */
@Component({
    selector: 'os-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent extends BaseComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: FormGroup;

    /**
     * Holding the values for the content.
     */
    public startContent: IStartContent = {
        welcome_title: '',
        welcome_text: ''
    };

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private formBuilder: FormBuilder,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
        this.startForm = this.formBuilder.group({
            welcome_title: ['', Validators.required],
            welcome_text: ''
        });
    }

    /**
     * Init the component.
     *
     * Sets the welcomeTitle and welcomeText.
     */
    public ngOnInit(): void {
        super.setTitle('Home');

        // set the welcome title
        this.subscriptions.push(
            this.meetingSettingsService.get('welcome_title').subscribe(welcomeTitle => {
                console.log('welcome title: ', welcomeTitle);
                this.startContent.welcome_title = welcomeTitle;
            }),

            // set the welcome text
            this.meetingSettingsService.get('welcome_text').subscribe(welcomeText => {
                this.startContent.welcome_text = this.translate.instant(welcomeText);
            })
        );
    }

    /**
     * Changes to editing mode.
     */
    public editStartPage(): void {
        Object.keys(this.startForm.controls).forEach(control => {
            this.startForm.patchValue({ [control]: this.startContent[control] });
        });
        this.isEditing = true;
    }

    /**
     * Saves changes and updates the content.
     */
    public saveChanges(): void {
        /*this.configRepo
            .bulkUpdate(
                Object.keys(this.startForm.controls).map(control => ({
                    key: control,
                    value: this.startForm.value[control]
                }))
            )
            .then(() => (this.isEditing = !this.isEditing), this.raiseError);*/
        throw new Error('TODO');
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms(Permission.meetingCanManageSettings);
    }
}
