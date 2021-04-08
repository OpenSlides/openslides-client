import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Organisation, OrganisationSetting } from 'app/shared/models/event-management/organisation';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class OrganisationRepositoryService extends BaseRepository<ViewOrganisation, Organisation> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Organisation);
    }

    public getTitle = (viewOrganisation: ViewOrganisation) => {
        return viewOrganisation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Organisations' : 'Organisation');
    };

    public getFieldsets(): Fieldsets<Organisation> {
        const settingsFieldset: (keyof OrganisationSetting)[] = [
            'custom_translations',
            'enable_electronic_voting',
            'legal_notice',
            'login_text',
            'privacy_policy',
            'reset_password_verbose_errors',
            'theme'
        ];
        const detailFieldset: (keyof Organisation)[] = [
            'committee_ids',
            'description',
            'name',
            'role_ids',
            'superadmin_role_id'
        ];
        return {
            [DEFAULT_FIELDSET]: detailFieldset,
            settings: settingsFieldset
        };
    }
}
