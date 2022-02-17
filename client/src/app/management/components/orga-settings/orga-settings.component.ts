import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { OrganizationAction } from 'app/core/actions/organization-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { OML } from 'app/core/core-services/organization-permission';
import { OrganizationRepositoryService } from 'app/core/repositories/management/organization-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewOrganization } from 'app/management/models/view-organization';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';

@Component({
    selector: `os-orga-settings`,
    templateUrl: `./orga-settings.component.html`,
    styleUrls: [`./orga-settings.component.scss`]
})
export class OrgaSettingsComponent extends BaseModelContextComponent implements OnInit {
    public readonly OML = OML;

    public pageTitle = _(`Settings`);
    private currentOrgaSettings: ViewOrganization;

    public orgaSettingsForm: FormGroup;

    public get hasEdits(): boolean {
        return this.orgaSettingsForm?.dirty || false;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private orgaRepo: OrganizationRepositoryService,
        private formBuilder: FormBuilder,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(this.pageTitle);
        this.createForm();

        this.subscribe({
            viewModelCtor: ViewOrganization,
            ids: [1],
            fieldset: `settings`
        });

        this.subscriptions.push(
            this.orgaRepo.getViewModelObservable(1).subscribe(orga => {
                this.currentOrgaSettings = orga;
                if (orga && !this.hasEdits) {
                    this.updateForm(this.currentOrgaSettings);
                }
            })
        );
    }

    public ngOnInit(): void {
        this.createForm();
    }

    private createForm(): void {
        if (this.currentOrgaSettings) {
            let rawSettingsForm: any = {
                name: [this.currentOrgaSettings.name],
                description: [this.currentOrgaSettings.description],
                legal_notice: [this.currentOrgaSettings.legal_notice],
                privacy_policy: [this.currentOrgaSettings.privacy_policy],
                login_text: [this.currentOrgaSettings.login_text]
            };
            if (this.operator.isSuperAdmin) {
                rawSettingsForm = {
                    ...rawSettingsForm,
                    url: [this.currentOrgaSettings.url],
                    reset_password_verbose_errors: [this.currentOrgaSettings.reset_password_verbose_errors],
                    enable_electronic_voting: [this.currentOrgaSettings.enable_electronic_voting],
                    enable_chat: [this.currentOrgaSettings.enable_chat],
                    limit_of_meetings: [this.currentOrgaSettings.limit_of_meetings ?? 0],
                    limit_of_users: [this.currentOrgaSettings.limit_of_users ?? 0]
                };
            }
            this.orgaSettingsForm = this.formBuilder.group(rawSettingsForm);
        } else {
            console.warn(`no Organization loaded`);
        }
    }

    public revertChanges(): void {
        if (this.orgaSettingsForm) {
            this.updateForm(this.currentOrgaSettings);
            this.markFormAsClean();
        }
    }

    private markFormAsClean(): void {
        if (this.orgaSettingsForm) {
            this.orgaSettingsForm.markAsUntouched();
            this.orgaSettingsForm.markAsPristine();
        }
    }

    private updateForm(viewOrga: ViewOrganization): void {
        if (!this.orgaSettingsForm) {
            this.createForm();
        }
        const patchMeeting: any = viewOrga.organization;
        this.orgaSettingsForm.patchValue(patchMeeting);
    }

    public onSubmit(): void {
        const payload: OrganizationAction.UpdatePayload = this.orgaSettingsForm.value;
        this.orgaRepo
            .update(payload)
            .then(() => this.markFormAsClean())
            .catch(this.raiseError);
    }
}
