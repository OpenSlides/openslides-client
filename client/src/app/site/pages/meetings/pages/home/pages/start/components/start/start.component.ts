import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-start`,
    templateUrl: `./start.component.html`,
    styleUrls: [`./start.component.scss`]
})
export class StartComponent extends BaseMeetingComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: UntypedFormGroup;

    public get welcomeTitleObservable(): Observable<string> {
        return this.meetingSettingsService.get(`welcome_title`);
    }

    public get welcomeTextObservable(): Observable<string> {
        return this.meetingSettingsService.get(`welcome_text`);
    }

    public constructor(
        protected override translate: TranslateService,
        private meetingRepositoryService: MeetingControllerService,
        private formBuilder: UntypedFormBuilder,
        private operator: OperatorService
    ) {
        super();
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
