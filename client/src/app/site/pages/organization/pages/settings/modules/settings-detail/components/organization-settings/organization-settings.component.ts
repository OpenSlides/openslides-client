import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { availableTranslations } from 'src/app/domain/definitions/languages';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-organization-settings`,
    templateUrl: `./organization-settings.component.html`,
    styleUrls: [`./organization-settings.component.scss`]
})
export class OrganizationSettingsComponent extends BaseComponent {
    public readonly pageTitle = _(`Settings`);
    public readonly translations = availableTranslations;

    public orgaSettingsForm: UntypedFormGroup | null = null;

    public get hasEdits(): boolean {
        return this.orgaSettingsForm?.dirty || false;
    }

    private _currentOrgaSettings: ViewOrganization | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private controller: OrganizationControllerService,
        private formBuilder: UntypedFormBuilder,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(this.pageTitle);

        this.subscriptions.push(
            this.controller.getViewModelObservable(ORGANIZATION_ID).subscribe(orga => {
                this._currentOrgaSettings = orga;
                if (orga) {
                    if (!this.orgaSettingsForm) {
                        this.orgaSettingsForm = this.createForm();
                    }
                    if (!this.hasEdits) {
                        this.updateForm(orga);
                    }
                }
            })
        );
    }

    private createForm(): UntypedFormGroup {
        let rawSettingsForm: any = {};
        if (this._currentOrgaSettings) {
            rawSettingsForm = {
                name: [this._currentOrgaSettings.name],
                description: [this._currentOrgaSettings.description],
                legal_notice: [this._currentOrgaSettings.legal_notice],
                privacy_policy: [this._currentOrgaSettings.privacy_policy],
                login_text: [this._currentOrgaSettings.login_text],
                users_email_body: [this._currentOrgaSettings.users_email_body],
                users_email_replyto: [this._currentOrgaSettings.users_email_replyto, [Validators.email]],
                users_email_sender: [this._currentOrgaSettings.users_email_sender],
                users_email_subject: [this._currentOrgaSettings.users_email_subject],
                default_language: [this._currentOrgaSettings.default_language]
            };
            if (this.operator.isSuperAdmin) {
                rawSettingsForm = {
                    ...rawSettingsForm,
                    url: [this._currentOrgaSettings.url],
                    reset_password_verbose_errors: [this._currentOrgaSettings.reset_password_verbose_errors],
                    enable_electronic_voting: [this._currentOrgaSettings.enable_electronic_voting],
                    enable_chat: [this._currentOrgaSettings.enable_chat],
                    limit_of_meetings: [this._currentOrgaSettings.limit_of_meetings ?? 0],
                    limit_of_users: [this._currentOrgaSettings.limit_of_users ?? 0],
                    saml_enabled: [this._currentOrgaSettings.saml_enabled ?? false],
                    saml_login_button_text: [this._currentOrgaSettings.saml_login_button_text],
                    saml_attr_mapping: [
                        this._currentOrgaSettings.saml_attr_mapping &&
                        typeof this._currentOrgaSettings.saml_attr_mapping !== `string`
                            ? JSON.stringify(this._currentOrgaSettings.saml_attr_mapping)
                            : this._currentOrgaSettings.saml_attr_mapping
                    ]
                };
            }
        } else {
            console.warn(`no Organization loaded`);
        }
        return this.formBuilder.group(rawSettingsForm);
    }

    public revertChanges(): void {
        if (this.orgaSettingsForm) {
            this.updateForm(this._currentOrgaSettings!);
            this.markFormAsClean();
        }
    }

    private markFormAsClean(): void {
        if (this.orgaSettingsForm) {
            this.orgaSettingsForm.markAsUntouched();
            this.orgaSettingsForm.markAsPristine();
        }
    }

    private updateForm(viewOrganization: ViewOrganization): void {
        if (!this.orgaSettingsForm) {
            this.orgaSettingsForm = this.createForm();
        }
        const patchMeeting: any = viewOrganization.organization;
        patchMeeting.saml_attr_mapping =
            patchMeeting.saml_attr_mapping && typeof patchMeeting.saml_attr_mapping !== `string`
                ? JSON.stringify(patchMeeting.saml_attr_mapping)
                : patchMeeting.saml_attr_mapping;
        this.orgaSettingsForm!.patchValue(patchMeeting);
    }

    public onSubmit(): void {
        const payload: any = this.orgaSettingsForm!.value;
        this.controller
            .update(payload)
            .then(() => this.markFormAsClean())
            .catch(this.raiseError);
    }
}
