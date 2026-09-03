import { inject, Service } from '@angular/core';
import { ORGANIZATION_ID } from '@app/site/pages/organization/services/organization.service';

import { Identifiable } from '../../../domain/interfaces/identifiable';
import { OrganizationTag } from '../../../domain/models/organization-tags/organization-tag';
import { ViewOrganizationTag } from '../../../site/pages/organization/pages/organization-tags/view-models/view-organization-tag';
import { ThemeService } from '../../../site/services/theme.service';
import { BaseRepository } from '../base-repository';
import { OrganizationTagAction } from './organization-tag.action';

@Service()
export class OrganizationTagRepositoryService extends BaseRepository<ViewOrganizationTag, OrganizationTag> {
    public baseModelCtor = OrganizationTag;

    private theme = inject(ThemeService);

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
