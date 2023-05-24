import { Injectable } from '@angular/core';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';

import { Organization, OrganizationAction, OrganizationSetting } from '../../domain/models/organizations/organization';
import { ViewOrganization } from '../../site/pages/organization/view-models/view-organization';
import { Fieldsets } from '../../site/services/model-request-builder';
import { BaseRepository } from './base-repository';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class OrganizationRepositoryService extends BaseRepository<ViewOrganization, Organization> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, Organization);
    }

    public getTitle = (viewOrganization: ViewOrganization) => viewOrganization.name;

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Organizations` : `Organization`);

    public override getFieldsets(): Fieldsets<Organization> {
        const coreFieldset: (keyof Organization)[] = [`name`, `description`];
        const settingsFieldset: (keyof (OrganizationSetting & Organization))[] = coreFieldset.concat(
            `url`,
            `legal_notice`,
            `privacy_policy`,
            `login_text`,
            `theme_id`,
            `enable_electronic_voting`,
            `reset_password_verbose_errors`,
            `enable_chat`,
            `limit_of_meetings`,
            `limit_of_users`,
            `users_email_body`,
            `users_email_replyto`,
            `users_email_sender`,
            `users_email_subject`,
            `saml_enabled`,
            `saml_login_button_text`,
            `saml_attr_mapping`,
            `default_language`
        );
        return {
            ...super.getFieldsets(),
            title: coreFieldset,
            settings: settingsFieldset
        };
    }

    public update(data: any): Promise<void> {
        data.id = ORGANIZATION_ID;
        if (data.saml_attr_mapping) {
            data.saml_attr_mapping = JSON.parse(data.saml_attr_mapping);
        }
        return this.sendActionToBackend(OrganizationAction.UPDATE, data);
    }
}
