import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { OrganizationTag } from '@app/domain/models/organization-tags/organization-tag';
import { OrganizationTagRepositoryService } from '@app/gateways/repositories/organization-tags/organization-tag-repository.service';
import { BaseController } from '@app/site/base/base-controller';
import { ControllerServiceCollectorService } from '@app/site/services/controller-service-collector.service';

import { ViewOrganizationTag } from '../../view-models';

@Injectable({
    providedIn: 'root'
})
export class OrganizationTagControllerService extends BaseController<ViewOrganizationTag, OrganizationTag> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: OrganizationTagRepositoryService
    ) {
        super(controllerServiceCollector, OrganizationTag, repo);
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
