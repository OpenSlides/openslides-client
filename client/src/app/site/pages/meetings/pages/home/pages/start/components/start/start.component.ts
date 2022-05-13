import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, filter } from 'rxjs';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { Permission } from 'src/app/domain/definitions/permission';

@Component({
    selector: 'os-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent extends BaseMeetingComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: FormGroup;

    public get welcomeTitleObservable(): Observable<string> {
        return this.meetingSettingsService.get(`welcome_title`);
    }

    public get welcomeTextObservable(): Observable<string> {
        return this.meetingSettingsService.get(`welcome_text`);
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private meetingRepositoryService: MeetingControllerService,
        private formBuilder: FormBuilder,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        this.startForm = this.formBuilder.group({
            welcome_title: [``, Validators.required],
            welcome_text: ``
        });
    }

    /**
     * Init the component.
     *
     * Sets the welcomeTitle and welcomeText.
     */
    public ngOnInit(): void {
        super.setTitle(`Home`);
    }

    /**
     * Changes to editing mode.
     */
    public editStartPage(): void {
        Object.keys(this.startForm.controls).forEach(control => {
            this.startForm.patchValue({ [control]: this.meetingSettingService.instant(control as keyof Settings) });
        });
        this.isEditing = true;
    }

    /**
     * Saves changes and updates the content.
     */
    public saveChanges(): void {
        this.meetingRepositoryService
            .update({
                id: this.activeMeetingId,
                ...this.startForm.value
            })
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
