import { Injectable } from '@angular/core';

import { CommitteeAction } from 'app/core/actions/committee-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class CommitteeRepositoryService
    extends BaseRepository<ViewCommittee, Committee>
    implements ModelRequestRepository {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private operator: OperatorService) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (viewCommittee: ViewCommittee) => {
        return viewCommittee.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Committees' : 'Committee');
    };

    public getFieldsets(): Fieldsets<Committee> {
        const titleFields: (keyof Committee)[] = ['name', 'description'];
        const listFields: (keyof Committee)[] = titleFields.concat([
            'meeting_ids',
            'forward_to_committee_ids',
            'organization_tag_ids',
            'user_ids'
        ]);
        const editFields: (keyof Committee)[] = titleFields.concat(['default_meeting_id', 'template_meeting_id']);
        return {
            [DEFAULT_FIELDSET]: titleFields,
            list: listFields,
            edit: editFields
        };
    }

    public create(committee: Partial<Committee>): Promise<Identifiable> {
        const payload: CommitteeAction.CreatePayload = {
            name: committee.name,
            organization_id: 1,
            description: committee.description,
            organisation_tag_ids: committee.organization_tag_ids,
            user_ids: committee.user_ids
        };
        return this.sendActionToBackend(CommitteeAction.CREATE, payload);
    }

    public update(update: Partial<Committee>, committee: ViewCommittee): Promise<void> {
        const payload: CommitteeAction.UpdatePayload = {
            id: committee.id,
            ...(update as CommitteeAction.UpdatePayload)
        };
        return this.sendActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public delete(committee: ViewCommittee): Promise<void> {
        return this.sendActionToBackend(CommitteeAction.DELETE, { id: committee.id });
    }

    /**
     * TODO: Currently, this doesn't work. It depends on the backend.
     *
     * @param committees
     * @returns
     */
    public bulkDelete(committees: ViewCommittee[]): Promise<void> {
        const payload: CommitteeAction.DeletePayload[] = committees.map(committee => ({ id: committee.id }));
        return this.sendBulkActionToBackend(CommitteeAction.DELETE, payload);
    }

    public bulkForwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeAction.UpdatePayload[] = committees.map(committee => {
            committeeIds = committeeIds.concat(committee.forward_to_committee_ids || []);
            return {
                id: committee.id,
                forward_to_committee_ids: committeeIds
            };
        });
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public bulkUnforwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeAction.UpdatePayload[] = committees.map(committee => ({
            id: committee.id,
            forward_to_committee_ids: (committee.forward_to_committee_ids || []).filter(id => committeeIds.includes(id))
        }));
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [1],
            follow: [
                {
                    idField: 'committee_ids'
                }
            ],
            fieldset: []
        };
    }

    protected createViewModel(model: Committee): ViewCommittee {
        const viewModel = super.createViewModel(model);
        viewModel.canAccess = () => {
            return (
                this.operator.hasCommitteePermissions(model.id, CML.can_manage) ||
                this.operator.hasOrganizationPermissions(OML.can_manage_users) ||
                this.operator.isInCommittees(model)
            );
        };
        return viewModel;
    }
}
