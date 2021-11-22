import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MeetingAction } from 'app/core/actions/meeting-action';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Settings } from '../../../../shared/models/event-management/meeting';

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

    public get welcomeTitleObservable(): Observable<string> {
        return this.meetingSettingService.get(`welcome_title`);
    }

    public get welcomeTextObservable(): Observable<string> {
        return this.meetingSettingService.get(`welcome_text`);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private activeMeetingService: ActiveMeetingService,
        private meetingRepositoryService: MeetingRepositoryService,
        private formBuilder: FormBuilder,
        private operator: OperatorService,
        private router: Router
    ) {
        super(componentServiceCollector, translate);
        this.startForm = this.formBuilder.group({
            welcome_title: [``, Validators.required],
            welcome_text: ``
        });

        // set the welcome title
        this.subscriptions.push(
            this.router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(() => this.requestUpdates()),
            this.activeMeetingService.meetingObservable.subscribe(meeting => (this.meeting = meeting))
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
            this.startForm.patchValue({ [control]: this.meetingSettingService.instant(control as keyof Settings) });
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
