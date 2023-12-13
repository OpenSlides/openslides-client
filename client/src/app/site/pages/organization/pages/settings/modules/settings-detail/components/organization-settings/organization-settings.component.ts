import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { availableTranslations } from 'src/app/domain/definitions/languages';
import { objectToFormattedString } from 'src/app/infrastructure/utils';
import { createEmailValidator } from 'src/app/infrastructure/utils/validators/email';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-organization-settings`,
    templateUrl: `./organization-settings.component.html`,
    styleUrls: [`./organization-settings.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSettingsComponent extends BaseComponent {
    public readonly pageTitle = _(`Settings`);
    public readonly translations = availableTranslations;

    public orgaSettingsForm: UntypedFormGroup | null = null;
    public newGenderForm: UntypedFormControl | null = null;

    private areGendersEdited = false;

    public get hasEdits(): boolean {
        return this.orgaSettingsForm?.dirty || this.areGendersEdited || false;
    }

    public get ssoConfigRows(): number {
        return this._ssoConfigRows;
    }

    public genders: string[] = [];

    public get is_new_gender_legal(): boolean {
        const new_gender = this.newGenderForm.value;
        return new_gender && !this.genders.includes(new_gender);
    }

    private _ssoConfigRows = 3;

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
                users_email_replyto: [this._currentOrgaSettings.users_email_replyto, [createEmailValidator()]],
                users_email_sender: [this._currentOrgaSettings.users_email_sender],
                users_email_subject: [this._currentOrgaSettings.users_email_subject],
                default_language: [this._currentOrgaSettings.default_language]
            };
            this.newGenderForm = this.formBuilder.control([``]);
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
                    ],
                    saml_metadata_idp: [this._currentOrgaSettings.saml_metadata_idp],
                    saml_metadata_sp: [this._currentOrgaSettings.saml_metadata_sp],
                    saml_private_key: [this._currentOrgaSettings.saml_private_key]
                };
            }
            this.genders = [...(this._currentOrgaSettings.genders ?? [])];
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

    public addGender(): void {
        if (this.is_new_gender_legal) {
            this.genders.push(this.newGenderForm.value);
            this.newGenderForm.setValue(``);
            this.areGendersEdited = true;
        }
    }

    public removeGender(toRemove: string): void {
        this.genders = this.genders.filter(gender => gender != toRemove);
        this.areGendersEdited = true;
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
        const patchOrga: any = viewOrganization.organization;
        if (patchOrga.saml_attr_mapping) {
            const attrMapping = objectToFormattedString(patchOrga.saml_attr_mapping);
            patchOrga.saml_attr_mapping = attrMapping;
            this._ssoConfigRows = attrMapping.split(`\n`).length;
        }
        this.genders = [...(patchOrga.genders ?? [])];
        this.areGendersEdited = false;
        this.orgaSettingsForm!.patchValue(patchOrga);
    }

    public onSubmit(): void {
        const payload: any = this.orgaSettingsForm!.value;
        if (this.operator.isSuperAdmin) {
            payload.saml_attr_mapping = !!payload.saml_attr_mapping
                ? JSON.stringify(JSON.parse(payload.saml_attr_mapping as string))
                : null;
        }
        for (const key of Object.keys(payload)) {
            if (this.orgaSettingsForm.get(key).pristine) {
                delete payload[key];
            }
        }
        if (this.genders.difference(this._currentOrgaSettings.genders ?? [], true).length) {
            payload[`genders`] = this.genders;
        }
        this.areGendersEdited = false;
        this.controller
            .update(payload)
            .then(() => this.markFormAsClean())
            .catch(this.raiseError);
    }
}
