import { Injectable } from '@angular/core';

import { OrganizationTagAction } from 'app/core/actions/organization-tag-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { ViewOrganization } from 'app/management/models/view-organization';
import { ViewOrganizationTag } from 'app/management/models/view-organization-tag';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { OrganizationTag } from 'app/shared/models/event-management/organization-tag';
import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from '../repository-service-collector-without-active-meeting-service';

@Injectable({
    providedIn: 'root'
})
export class OrganizationTagRepositoryService
    extends BaseRepository<ViewOrganizationTag, OrganizationTag>
    implements ModelRequestRepository
{
    public constructor(serviceCollector: RepositoryServiceCollectorWithoutActiveMeetingService) {
        super(serviceCollector, OrganizationTag);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? 'tags' : 'tag');
    public getTitle = (viewModel: ViewOrganizationTag): string => viewModel.name;
    public getFieldsets(): Fieldsets<OrganizationTag> {
        const detailFieldset: (keyof OrganizationTag)[] = ['color', 'name', 'committee_ids', 'organization_id'];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }

    public create(tag: OrganizationTagAction.OrganizationTagPayload): Promise<Identifiable> {
        const payload: OrganizationTagAction.CreatePayload = {
            name: tag.name,
            color: tag.color,
            organization_id: ORGANIZATION_ID
        };
        return this.sendActionToBackend(OrganizationTagAction.CREATE, payload);
    }

    public update(
        update: Partial<OrganizationTagAction.OrganizationTagPayload>,
        viewModel: ViewOrganizationTag
    ): Promise<void> {
        const payload: OrganizationTagAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            color: update.color
        };
        return this.sendActionToBackend(OrganizationTagAction.UPDATE, payload);
    }

    public delete(...organizationTags: ViewOrganizationTag[]): Promise<void> {
        const payload: OrganizationTagAction.DeletePayload[] = organizationTags.map(orgaTag => ({ id: orgaTag.id }));
        return this.sendBulkActionToBackend(OrganizationTagAction.DELETE, payload);
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [1],
            follow: [
                {
                    idField: 'organization_tag_ids'
                }
            ],
            fieldset: []
        };
    }
}
