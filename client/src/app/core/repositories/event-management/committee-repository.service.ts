import { Injectable } from '@angular/core';

import { CommitteeAction } from 'app/core/actions/committee-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';
import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class CommitteeRepositoryService
    extends BaseRepository<ViewCommittee, Committee>
    implements ModelRequestRepository {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
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
            'member_ids',
            'manager_ids',
            'forward_to_committee_ids'
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
            organisation_id: 1,
            description: committee.description,
            member_ids: committee.member_ids,
            manager_ids: committee.manager_ids
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
            viewModelCtor: ViewOrganisation,
            ids: [1],
            follow: [
                {
                    idField: 'committee_ids'
                }
            ],
            fieldset: []
        };
    }
}
