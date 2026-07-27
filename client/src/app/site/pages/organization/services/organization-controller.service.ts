import { inject, Service } from '@angular/core';

import { Organization } from '../../../../domain/models/organizations/organization';
import { OrganizationRepositoryService } from '../../../../gateways/repositories/organization-repository.service';
import { BaseController } from '../../../base/base-controller';
import { ControllerServiceCollectorService } from '../../../services/controller-service-collector.service';
import { ViewOrganization } from '../view-models/view-organization';

@Service()
export class OrganizationControllerService extends BaseController<ViewOrganization, Organization> {
    protected override repo: OrganizationRepositoryService;

    public constructor() {
        const repositoryServiceCollector = inject(ControllerServiceCollectorService);
        const repo = inject(OrganizationRepositoryService);
        super(repositoryServiceCollector, Organization, repo);
    }

    public getTitle = (_viewModel: ViewOrganization): string => ``;

    public update(update: Partial<Organization>): Promise<void> {
        return this.repo.update(update);
    }
}
