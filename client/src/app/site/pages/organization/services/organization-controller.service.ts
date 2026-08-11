import { inject, Service } from '@angular/core';

import { Organization } from '../../../../domain/models/organizations/organization';
import { OrganizationRepositoryService } from '../../../../gateways/repositories/organization-repository.service';
import { BaseController } from '../../../base/base-controller';
import { ViewOrganization } from '../view-models/view-organization';

@Service()
export class OrganizationControllerService extends BaseController<ViewOrganization, Organization> {
    protected repo: OrganizationRepositoryService = inject(OrganizationRepositoryService);

    public constructor() {
        super(Organization);
    }

    public getTitle = (_viewModel: ViewOrganization): string => ``;

    public update(update: Partial<Organization>): Promise<void> {
        return this.repo.update(update);
    }
}
