import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MeetingAction } from 'app/core/actions/meeting-action';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';

/**
 * The start component. Greeting page for OpenSlides
 */
@Component({
    selector: `os-start`,
    templateUrl: `./start.component.html`,
    styleUrls: [`./start.component.scss`]
})
export class StartComponent extends BaseModelContextComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: FormGroup;

    private meeting: ViewMeeting;

    /**
     * Holding the values for the content.
     */
    public startContent: Partial<MeetingAction.OptionalUpdatePayload> = {
        welcome_title: ``,
        welcome_text: ``
    };

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private activeMeetingService: ActiveMeetingService,
        private meetingRepositoryService: MeetingRepositoryService,
        private formBuilder: FormBuilder,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        this.startForm = this.formBuilder.group({
            welcome_title: [``, Validators.required],
            welcome_text: ``
        });

        // set the welcome title
        this.subscriptions.push(
            this.meetingSettingsService.get(`welcome_title`).subscribe(welcomeTitle => {
                this.startContent.welcome_title = welcomeTitle;
            }),
            this.meetingSettingsService.get(`welcome_text`).subscribe(welcomeText => {
                this.startContent.welcome_text = this.translate.instant(welcomeText);
            }),
            this.activeMeetingService.meetingObservable.subscribe(meeting => {
                this.meeting = meeting;
            })
        );
    }

    /**
     * Init the component.
     *
     * Sets the welcomeTitle and welcomeText.
     */
    public ngOnInit(): void {
        super.setTitle(`Home`);
        this.requestUpdates();
    }

    private requestUpdates(): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingService.meetingId],
            fieldset: `startPage`
        });
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
        this.meetingRepositoryService
            .update(this.startForm.value as MeetingAction.OptionalUpdatePayload, this.meeting)
            .then(() => {
                this.isEditing = false;
            })
            .catch(this.raiseError);
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms(Permission.meetingCanManageSettings);
    }
}
