import { Injectable } from '@angular/core';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';

import { Identifiable } from '../../../domain/interfaces';
import { OrganizationTag } from '../../../domain/models/organization-tags/organization-tag';
import { ViewOrganizationTag } from '../../../site/pages/organization/pages/organization-tags';
import { ThemeService } from '../../../site/services/theme.service';
import { BaseBackendRepository } from '../base-backend-repository';
import { OrganizationTagAction } from './organization-tag.action';

@Injectable({
    providedIn: `root`
})
export class OrganizationTagRepositoryService extends BaseBackendRepository<ViewOrganizationTag, OrganizationTag> {
    public constructor(private theme: ThemeService) {
        super(OrganizationTag);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Tags` : `Tag`);
    public getTitle = (viewModel: ViewOrganizationTag): string => viewModel.name;

    public async create(...tags: Partial<OrganizationTag>[]): Promise<Identifiable[]> {
        const payload = tags.map(tag => ({
            name: tag.name,
            color: tag.color ?? this.theme.currentAccentColor,
            organization_id: ORGANIZATION_ID
        }));
        return this.sendBulkActionToBackend(OrganizationTagAction.CREATE, payload);
    }

    public async update(update: Partial<OrganizationTag>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            color: update.color
        };
        return this.sendActionToBackend(OrganizationTagAction.UPDATE, payload);
    }

    public async delete(...organizationTags: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = organizationTags.map(orgaTag => ({ id: orgaTag.id }));
        return this.sendBulkActionToBackend(OrganizationTagAction.DELETE, payload);
    }
}
