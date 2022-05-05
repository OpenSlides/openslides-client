import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { Organization } from '../../../domain/models/organizations/organization';
import { ViewOrganization } from './view-models/view-organization';
import { OrganizationRepositoryService } from '../../../gateways/repositories/organization-repository.service';

export const OrganizationAppConfig: AppConfig = {
    name: `Organization`,
    models: [
        {
            model: Organization,
            viewModel: ViewOrganization,
            repository: OrganizationRepositoryService
        }
    ]
};
