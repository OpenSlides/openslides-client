import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { OrganizationAction } from 'app/core/actions/organization-action';
import { OrganisationRepositoryService } from 'app/core/repositories/event-management/organisation-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Themes } from 'app/core/ui-services/theme.service';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';

@Component({
    selector: 'os-orga-settings',
    templateUrl: './orga-settings.component.html',
    styleUrls: ['./orga-settings.component.scss']
})
export class OrgaSettingsComponent extends BaseModelContextComponent implements OnInit {
    public pageTitle = _('Settings');
    private currentOrgaSettings: ViewOrganisation;

    public orgaSettingsForm: FormGroup;
    public themes = Themes;

    public get hasEdits(): boolean {
        return this.orgaSettingsForm?.dirty || false;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private orgaRepo: OrganisationRepositoryService,
        private formBuilder: FormBuilder
    ) {
        super(componentServiceCollector);
        super.setTitle(this.pageTitle);
        this.createForm();

        this.requestModels({
            viewModelCtor: ViewOrganisation,
            ids: [1],
            fieldset: 'settings'
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
            this.orgaSettingsForm = this.formBuilder.group({
                name: [this.currentOrgaSettings.name],
                description: [this.currentOrgaSettings.description],
                legal_notice: [this.currentOrgaSettings.legal_notice],
                privacy_policy: [this.currentOrgaSettings.privacy_policy],
                login_text: [this.currentOrgaSettings.login_text],
                theme: [this.currentOrgaSettings.theme]
            });
        } else {
            console.warn('no Organisation loaded');
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

    private updateForm(viewOrga: ViewOrganisation): void {
        if (this.orgaSettingsForm) {
            const patchMeeting: any = viewOrga.organisation;
            this.orgaSettingsForm.patchValue(patchMeeting);
        }
    }

    public onSubmit(): void {
        const payload: OrganizationAction.UpdatePayload = this.orgaSettingsForm.value;
        this.markFormAsClean();
        this.orgaRepo.update(payload).catch(this.raiseError);
    }
}
