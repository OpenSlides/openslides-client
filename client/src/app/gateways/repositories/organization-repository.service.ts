import { Injectable } from '@angular/core';
import { Organization, OrganizationAction, OrganizationSetting } from '../../domain/models/organizations/organization';
import { DEFAULT_FIELDSET, Fieldsets } from '../../site/services/model-request-builder';
import { ViewOrganization } from '../../site/pages/organization/view-models/view-organization';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';
import { BaseRepository } from './base-repository';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: 'root'
})
export class OrganizationRepositoryService extends BaseRepository<ViewOrganization, Organization> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, Organization);
    }

    public getTitle = (viewOrganization: ViewOrganization) => viewOrganization.name;

    public getVerboseName = (plural: boolean = false) => _(plural ? `Organizations` : `Organization`);

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
            `limit_of_users`
        );
        const detailFieldset: (keyof Organization)[] = coreFieldset.concat(`committee_ids`, `organization_tag_ids`);
        return {
            [DEFAULT_FIELDSET]: detailFieldset,
            title: coreFieldset,
            list: detailFieldset,
            settings: settingsFieldset
        };
    }

    public update(data: any): Promise<void> {
        data.id = ORGANIZATION_ID;
        return this.sendActionToBackend(OrganizationAction.UPDATE, data);
    }
}
