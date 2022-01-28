import { Injectable } from '@angular/core';
import { CommitteeAction } from 'app/core/actions/committee-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest,
    TypedFieldset
} from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';

import { BaseRepository } from '../base-repository';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { UserRepositoryService } from '../users/user-repository.service';

@Injectable({
    providedIn: `root`
})
export class CommitteeRepositoryService
    extends BaseRepository<ViewCommittee, Committee>
    implements ModelRequestRepository
{
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private operator: OperatorService,
        private userRepo: UserRepositoryService
    ) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (viewCommittee: ViewCommittee) => viewCommittee.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Committees` : `Committee`);

    public getFieldsets(): Fieldsets<Committee> {
        const titleFields: TypedFieldset<Committee> = [`name`, `description`];
        const listFields = titleFields.concat([
            `meeting_ids`,
            `forward_to_committee_ids`,
            `receive_forwardings_from_committee_ids`,
            `organization_tag_ids`,
            `user_ids`,
            { templateField: `user_$_management_level` }
        ]);
        const editFields = titleFields.concat([`default_meeting_id`, `template_meeting_id`]);
        return {
            [DEFAULT_FIELDSET]: titleFields,
            list: listFields,
            edit: editFields
        };
    }

    public create(...committees: any[]): Promise<Identifiable[]> {
        const payload: CommitteeAction.CreatePayload[] = committees.map(committee => ({
            name: committee.name,
            organization_id: ORGANIZATION_ID,
            ...this.getPartialCommitteePayload(committee)
        }));
        return this.sendBulkActionToBackend(CommitteeAction.CREATE, payload);
    }

    public update(update?: any, ...committees: ViewCommittee[]): Promise<void> {
        const createPayload = (id: Id, model: Partial<Committee>) => ({
            id,
            name: model.name,
            default_meeting_id: model.default_meeting_id,
            ...this.getPartialCommitteePayload(model)
        });
        const payload: CommitteeAction.UpdatePayload[] = committees.map(committee =>
            createPayload(committee.id, update ?? committee)
        );
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public delete(...committees: ViewCommittee[]): Promise<void> {
        const payload: CommitteeAction.DeletePayload[] = committees.map(committee => ({ id: committee.id }));
        return this.sendBulkActionToBackend(CommitteeAction.DELETE, payload);
    }

    public bulkForwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeAction.UpdatePayload[] = committees.map(committee => {
            const forwardToIds = new Set(committeeIds.concat(committee.forward_to_committee_ids || []));
            return {
                id: committee.id,
                forward_to_committee_ids: Array.from(forwardToIds)
            };
        });
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public bulkUnforwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: CommitteeAction.UpdatePayload[] = committees.map(committee => ({
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
                    idField: `committee_ids`
                }
            ],
            fieldset: []
        };
    }

    protected createViewModel(model: Committee): ViewCommittee {
        const viewModel = super.createViewModel(model);
        viewModel.getViewUser = (id: Id) => this.userRepo.getViewModel(id);
        viewModel.canAccess = () =>
            this.operator.hasCommitteePermissions(model.id, CML.can_manage) ||
            this.operator.hasOrganizationPermissions(OML.can_manage_users) ||
            this.operator.isInCommitteesNonAdminCheck(model);
        return viewModel;
    }

    /**
     * TODO CLEANUP: This seems unnecessary.
     * removing all entries that are not fit to a class can be done using
     * decorators
     * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
     */
    private getPartialCommitteePayload(committee: any): CommitteeAction.PartialPayload {
        return {
            description: committee.description,
            organization_tag_ids: committee.organization_tag_ids === null ? [] : committee.organization_tag_ids,
            user_$_management_level: committee.user_$_management_level,
            forward_to_committee_ids:
                committee.forward_to_committee_ids === null ? [] : committee.forward_to_committee_ids,
            receive_forwardings_from_committee_ids:
                committee.receive_forwardings_from_committee_ids === null
                    ? []
                    : committee.receive_forwardings_from_committee_ids
        };
    }
}
