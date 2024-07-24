import { Injectable } from '@angular/core';

import { Organization } from '../../../../domain/models/organizations/organization';
import { OrganizationRepositoryService } from '../../../../gateways/repositories/organization-repository.service';
import { BaseController } from '../../../base/base-controller';
import { ViewOrganization } from '../view-models/view-organization';

@Injectable({
    providedIn: `root`
})
export class OrganizationControllerService extends BaseController<ViewOrganization, Organization> {
    public constructor(protected override repo: OrganizationRepositoryService) {
        super(Organization, repo);
    }

    public getTitle = (_viewModel: ViewOrganization): string => ``;

    public update(update: Partial<Organization>): Promise<void> {
        return this.repo.update(update);
    }
}
