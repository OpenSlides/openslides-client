import { Injectable } from '@angular/core';
import { Organization } from '../../../../domain/models/organizations/organization';
import { BaseController } from '../../../base/base-controller';
import { ViewOrganization } from '../view-models/view-organization';
import { ControllerServiceCollectorService } from '../../../services/controller-service-collector.service';
import { OrganizationRepositoryService } from '../../../../gateways/repositories/organization-repository.service';

@Injectable({
    providedIn: 'root'
})
export class OrganizationControllerService extends BaseController<ViewOrganization, Organization> {
    public constructor(
        repositoryServiceCollector: ControllerServiceCollectorService,
        protected override repo: OrganizationRepositoryService
    ) {
        super(repositoryServiceCollector, Organization, repo);
    }

    public getTitle = (viewModel: ViewOrganization) => ``;

    public update(update: Partial<Organization>): Promise<void> {
        return this.repo.update(update);
    }
}
