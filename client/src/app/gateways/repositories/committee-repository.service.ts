import { Injectable } from '@angular/core';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { Id } from '../../domain/definitions/key-types';
import { CML, OML } from '../../domain/definitions/organization-permission';
import { Identifiable } from '../../domain/interfaces';
import { Committee } from '../../domain/models/comittees/committee';
import { ViewCommittee } from '../../site/pages/organization/pages/committees';
import { Fieldsets, TypedFieldset } from '../../site/services/model-request-builder';
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

    public getTitle = (viewCommittee: ViewCommittee): string => viewCommittee.name;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Committees` : `Committee`);

    public override getFieldsets(): Fieldsets<Committee> {
        const nameFields: TypedFieldset<Committee> = [`name`];
        const listFields: TypedFieldset<Committee> = nameFields.concat([
            `description`,
            `meeting_ids`,
            `forward_to_committee_ids`,
            `receive_forwardings_from_committee_ids`,
            `organization_tag_ids`,
            `user_ids`,
            `manager_ids`,
            `external_id`,
            `native_user_ids`,
            `parent_id`,
            `child_ids`,
            `all_parent_ids`,
            `all_child_ids`
        ]);

        return {
            ...super.getFieldsets(),
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
        const createPayload = (id: Id, model: Partial<Committee>): any => ({
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

    public committeeJsonUpload(payload: Record<string, any>): Action<BackendImportRawPreview> {
        return this.createAction<BackendImportRawPreview>(CommitteeAction.JSON_UPLOAD, payload);
    }

    public committeeImport(payload: { id: number; import: boolean }[]): Action<BackendImportRawPreview | void> {
        return this.createAction<BackendImportRawPreview | void>(CommitteeAction.IMPORT, payload);
    }

    protected override createViewModel(model: Committee): ViewCommittee {
        const viewModel = super.createViewModel(model);
        viewModel.getViewUser = (id: Id): ViewUser => this.userRepo.getViewModel(id);
        viewModel.canAccess = (): boolean =>
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
            manager_ids: committee.manager_ids,
            forward_to_committee_ids:
                committee.forward_to_committee_ids === null ? [] : committee.forward_to_committee_ids,
            receive_forwardings_from_committee_ids:
                committee.receive_forwardings_from_committee_ids === null
                    ? []
                    : committee.receive_forwardings_from_committee_ids,
            external_id: committee.external_id,
            native_user_ids: committee.native_user_ids === null ? [] : committee.native_user_ids,
            parent_id: !committee.parent_id ? undefined : committee.parent_id,
            all_parent_ids: committee.all_parent_ids,
            all_child_ids: committee.all_child_ids
        };
    }
}
