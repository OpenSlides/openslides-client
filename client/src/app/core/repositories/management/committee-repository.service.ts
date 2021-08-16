import { Injectable } from '@angular/core';

import { CommitteeAction } from 'app/core/actions/committee-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { useDataClass } from 'app/core/decorators/data-class';
import { Id } from 'app/core/definitions/key-types';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { CommitteeUpdatePayload, CommitteeDeletePayload, CommitteeCreatePayload } from '../../actions/committee-action';

@Injectable({
    providedIn: 'root'
})
export class CommitteeRepositoryService
    extends BaseRepository<ViewCommittee, Committee>
    implements ModelRequestRepository
{
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private operator: OperatorService) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (viewCommittee: ViewCommittee) => viewCommittee.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? 'Committees' : 'Committee');

    public getFieldsets(): Fieldsets<Committee> {
        const titleFields: (keyof Committee)[] = ['name', 'description'];
        const listFields: (keyof Committee)[] = titleFields.concat([
            'meeting_ids',
            'forward_to_committee_ids',
            'receive_forwardings_from_committee_ids',
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

    @useDataClass(CommitteeAction.CREATE)
    public create(committee: Partial<Committee>): Promise<Identifiable> {
        const payload: CommitteeCreatePayload = {
            ...committee,
            name: committee.name,
            organization_id: ORGANIZATION_ID
        };
        return this.sendActionToBackend(CommitteeAction.CREATE, payload);
    }

    @useDataClass(CommitteeAction.UPDATE)
    public update(update: Partial<Committee>, committee: ViewCommittee): Promise<void> {
        const payload: CommitteeUpdatePayload = {
            ...update,
            id: committee.id
        };
        return this.sendActionToBackend(CommitteeAction.UPDATE, payload);
    }

    @useDataClass(CommitteeAction.DELETE)
    public delete(...committees: ViewCommittee[]): Promise<void> {
        const payload: CommitteeDeletePayload[] = committees.map(committee => ({ id: committee.id }));
        return this.sendBulkActionToBackend(CommitteeAction.DELETE, payload);
    }

    public bulkForwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeUpdatePayload[] = committees.map(committee => {
            const forwardToIds = new Set(committeeIds.concat(committee.forward_to_committee_ids || []));
            return {
                id: committee.id,
                forward_to_committee_ids: Array.from(forwardToIds)
            };
        });
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public bulkUnforwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeUpdatePayload[] = committees.map(committee => ({
            id: committee.id,
            forward_to_committee_ids: (committee.forward_to_committee_ids || []).filter(
                id => !committeeIds.includes(id)
            )
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
        viewModel.canAccess = () =>
            this.operator.hasCommitteePermissions(model.id, CML.can_manage) ||
            this.operator.hasOrganizationPermissions(OML.can_manage_users) ||
            this.operator.isInCommitteesNonAdminCheck(model);
        return viewModel;
    }
}
