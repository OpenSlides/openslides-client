import { Injectable } from '@angular/core';
import { ViewOrganizationTag } from '../../view-models';
import { BaseController } from 'src/app/site/base/base-controller';
import { OrganizationTag } from 'src/app/domain/models/organization-tags/organization-tag';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { OrganizationTagRepositoryService } from 'src/app/gateways/repositories/organization-tags/organization-tag-repository.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { OrganizationTagCommonServiceModule } from '../organization-tag-common-service.module';

@Injectable({
    providedIn: OrganizationTagCommonServiceModule
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
