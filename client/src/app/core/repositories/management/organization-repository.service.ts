import { Injectable } from '@angular/core';
import { OrganizationAction } from 'app/core/actions/organization-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Organization, OrganizationSetting } from 'app/shared/models/event-management/organization';

import { ORGANIZATION_ID } from '../../core-services/organization.service';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: `root`
})
export class OrganizationRepositoryService extends BaseRepository<ViewOrganization, Organization> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Organization);
    }

    public getTitle = (viewOrganization: ViewOrganization) => viewOrganization.name;

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Organizations` : `Organization`);

    public getFieldsets(): Fieldsets<Organization> {
        const coreFieldset: (keyof Organization)[] = [
            `name`,
            `description`,
            `active_meeting_ids`,
            `archived_meeting_ids`,
            `template_meeting_ids`
        ];
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

    public update(update: Partial<OrganizationAction.UpdatePayload>): Promise<void> {
        update.id = ORGANIZATION_ID;
        return this.sendActionToBackend(OrganizationAction.UPDATE, update);
    }
}
