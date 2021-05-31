import { Injectable } from '@angular/core';

import { OrganizationAction } from 'app/core/actions/organization-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ViewOrganisation } from 'app/management/models/view-organisation';
import { Organisation, OrganisationSetting } from 'app/shared/models/event-management/organisation';
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
        const coreFieldset: (keyof Organisation)[] = ['name', 'description'];
        const settingsFieldset: (keyof (OrganisationSetting & Organisation))[] = coreFieldset.concat(
            'legal_notice',
            'privacy_policy',
            'login_text',
            'theme',
            'custom_translations',
            'reset_password_verbose_errors'
        );
        const listFieldset: (keyof Organisation)[] = coreFieldset.concat('committee_ids', 'organisation_tag_ids');
        const detailFieldset: (keyof Organisation)[] = listFieldset.concat('role_ids', 'superadmin_role_id');
        return {
            [DEFAULT_FIELDSET]: detailFieldset,
            title: coreFieldset,
            list: listFieldset,
            settings: settingsFieldset
        };
    }

    public update(update: OrganizationAction.UpdatePayload): Promise<void> {
        /**
         * I suppose the orga id is always 1
         */
        update.id = 1;
        return this.sendActionToBackend(OrganizationAction.UPDATE, update);
    }
}
