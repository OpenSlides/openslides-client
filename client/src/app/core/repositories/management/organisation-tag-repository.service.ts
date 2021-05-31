import { Injectable } from '@angular/core';

import { OrganisationTagAction } from 'app/core/actions/organisation-tag-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { ORGANISATION_ID } from 'app/core/core-services/organisation.service';
import { ViewOrganisation } from 'app/management/models/view-organisation';
import { ViewOrganisationTag } from 'app/management/models/view-organisation-tag';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { OrganisationTag } from 'app/shared/models/event-management/organisation-tag';
import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from '../repository-service-collector-without-active-meeting-service';

@Injectable({
    providedIn: 'root'
})
export class OrganisationTagRepositoryService
    extends BaseRepository<ViewOrganisationTag, OrganisationTag>
    implements ModelRequestRepository {
    public constructor(serviceCollector: RepositoryServiceCollectorWithoutActiveMeetingService) {
        super(serviceCollector, OrganisationTag);
    }

    public getVerboseName = (plural?: boolean): string => {
        return plural ? 'Organization tags' : 'Organization tag';
    };
    public getTitle = (viewModel: ViewOrganisationTag): string => {
        return viewModel.name;
    };
    public getFieldsets(): Fieldsets<OrganisationTag> {
        const detailFieldset: (keyof OrganisationTag)[] = ['color', 'name', 'committee_ids', 'organisation_id'];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }

    public create(tag: OrganisationTagAction.OrganisationTagPayload): Promise<Identifiable> {
        const payload: OrganisationTagAction.CreatePayload = {
            name: tag.name,
            color: tag.color,
            organisation_id: ORGANISATION_ID
        };
        return this.sendActionToBackend(OrganisationTagAction.CREATE, payload);
    }

    public update(
        update: Partial<OrganisationTagAction.OrganisationTagPayload>,
        viewModel: ViewOrganisationTag
    ): Promise<void> {
        const payload: OrganisationTagAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            color: update.color
        };
        return this.sendActionToBackend(OrganisationTagAction.UPDATE, payload);
    }

    public delete(...organisationTags: ViewOrganisationTag[]): Promise<void> {
        const payload: OrganisationTagAction.DeletePayload[] = organisationTags.map(orgaTag => ({ id: orgaTag.id }));
        return this.sendBulkActionToBackend(OrganisationTagAction.DELETE, payload);
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganisation,
            ids: [1],
            follow: [
                {
                    idField: 'organisation_tag_ids'
                }
            ],
            fieldset: []
        };
    }
}
