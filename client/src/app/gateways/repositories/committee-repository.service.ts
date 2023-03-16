import { Injectable } from '@angular/core';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';

import { Id } from '../../domain/definitions/key-types';
import { CML, OML } from '../../domain/definitions/organization-permission';
import { Identifiable } from '../../domain/interfaces';
import { Committee } from '../../domain/models/comittees/committee';
import { ViewCommittee } from '../../site/pages/organization/pages/committees';
import { DEFAULT_FIELDSET, Fieldsets, TypedFieldset } from '../../site/services/model-request-builder';
import { OperatorService } from '../../site/services/operator.service';
import { Action } from '../actions';
import { BaseRepository } from './base-repository';
import { CommitteeAction } from './committees/committee.action';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';
import { UserRepositoryService } from './users/user-repository.service';

@Injectable({
    providedIn: `root`
})
export class CommitteeRepositoryService extends BaseRepository<ViewCommittee, Committee> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private operator: OperatorService,
        private userRepo: UserRepositoryService
    ) {
        super(repositoryServiceCollector, Committee);
    }

    public getTitle = (viewCommittee: ViewCommittee) => viewCommittee.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Committees` : `Committee`);

    public override getFieldsets(): Fieldsets<Committee> {
        const nameFields: TypedFieldset<Committee> = [`name`];
        const listFields: TypedFieldset<Committee> = nameFields.concat([
            `description`,
            `meeting_ids`,
            `forward_to_committee_ids`,
            `receive_forwardings_from_committee_ids`,
            `organization_tag_ids`,
            `user_ids`,
            { templateField: `user_$_management_level` }
        ]);
        const detailFields: TypedFieldset<Committee> = [`default_meeting_id`];
        return {
            [DEFAULT_FIELDSET]: detailFields,
            list: listFields,
            name: nameFields
        };
    }

    public create(...committees: any[]): Promise<Identifiable[]> {
        const payload: any[] = committees.map(committee => ({
            name: committee.name,
            organization_id: ORGANIZATION_ID,
            ...this.getPartialCommitteePayload(committee)
        }));
        return this.sendBulkActionToBackend(CommitteeAction.CREATE, payload);
    }

    public update(update?: any, ...committees: ViewCommittee[]): Action<void> {
        const createPayload = (id: Id, model: Partial<Committee>) => ({
            id,
            name: model.name,
            default_meeting_id: model.default_meeting_id,
            ...this.getPartialCommitteePayload(model)
        });
        const payload: any[] = committees.map(committee => createPayload(committee.id, update ?? committee));
        return this.createAction(CommitteeAction.UPDATE, payload);
    }

    public delete(...committees: ViewCommittee[]): Promise<void> {
        const payload: any[] = committees.map(committee => ({ id: committee.id }));
        return this.sendBulkActionToBackend(CommitteeAction.DELETE, payload);
    }

    public bulkForwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: any[] = committees.map(committee => {
            const forwardToIds = new Set(committeeIds.concat(committee.forward_to_committee_ids || []));
            return {
                id: committee.id,
                forward_to_committee_ids: Array.from(forwardToIds)
            };
        });
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    public bulkUnforwardToCommittees(committees: ViewCommittee[], committeeIds: Id[]): Promise<void> {
        const payload: any[] = committees.map(committee => ({
            id: committee.id,
            forward_to_committee_ids: (committee.forward_to_committee_ids || []).filter(
                id => !committeeIds.includes(id)
            )
        }));
        return this.sendBulkActionToBackend(CommitteeAction.UPDATE, payload);
    }

    protected override createViewModel(model: Committee): ViewCommittee {
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
    private getPartialCommitteePayload(committee: any): any {
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
