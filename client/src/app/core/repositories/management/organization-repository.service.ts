import { Injectable } from '@angular/core';

import { OrganizationAction } from 'app/core/actions/organization-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Organization, OrganizationSetting } from 'app/shared/models/event-management/organization';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class OrganizationRepositoryService extends BaseRepository<ViewOrganization, Organization> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Organization);
    }

    public getTitle = (viewOrganization: ViewOrganization) => viewOrganization.name;

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? 'Organizations' : 'Organization');

    public getFieldsets(): Fieldsets<Organization> {
        const coreFieldset: (keyof Organization)[] = ['name', 'description'];
        const settingsFieldset: (keyof (OrganizationSetting & Organization))[] = coreFieldset.concat(
            'legal_notice',
            'privacy_policy',
            'login_text',
            'theme',
            'enable_electronic_voting',
            'reset_password_verbose_errors'
        );
        const detailFieldset: (keyof Organization)[] = coreFieldset.concat('committee_ids', 'organization_tag_ids');
        return {
            [DEFAULT_FIELDSET]: detailFieldset,
            title: coreFieldset,
            list: detailFieldset,
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
