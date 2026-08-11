import { inject, Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { OrganizationTag } from '@app/domain/models/organization-tags/organization-tag';
import { OrganizationTagRepositoryService } from '@app/gateways/repositories/organization-tags/organization-tag-repository.service';
import { BaseController } from '@app/site/base/base-controller';

import { ViewOrganizationTag } from '../../view-models';

@Injectable({
    providedIn: 'root'
})
export class OrganizationTagControllerService extends BaseController<ViewOrganizationTag, OrganizationTag> {
    protected repo: OrganizationTagRepositoryService = inject(OrganizationTagRepositoryService);

    public constructor() {
        super(OrganizationTag);
    }

    public create(...models: Partial<OrganizationTag>[]): Promise<Identifiable[]> {
        return this.repo.create(...models);
    }

    public update(update: Partial<OrganizationTag>, viewOrgaTag: Identifiable): Promise<void> {
        return this.repo.update(update, viewOrgaTag);
    }

    public delete(...ids: Identifiable[]): Promise<void> {
        return this.repo.delete(...ids);
    }
}
