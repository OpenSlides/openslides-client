import { OrganizationTag } from 'src/app/domain/models/organization-tags/organization-tag';
import { OrganizationTagRepositoryService } from 'src/app/gateways/repositories/organization-tags';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import { ViewOrganizationTag } from './view-models/view-organization-tag';
export const OrganizationTagsAppConfig: AppConfig = {
    name: `organization-tag`,
    models: [
        {
            model: OrganizationTag,
            viewModel: ViewOrganizationTag,
            repository: OrganizationTagRepositoryService
        }
    ]
};
