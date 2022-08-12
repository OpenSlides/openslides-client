import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { ViewMotionState } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionStateAction } from './motion-state.action';

@Injectable({
    providedIn: `root`
})
export class MotionStateRepositoryService extends BaseMeetingRelatedRepository<ViewMotionState, MotionState> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionState);
    }

    public override getFieldsets(): Fieldsets<MotionState> {
        const detailFields: (keyof MotionState)[] = [
            `name`,
            `css_class`,
            `recommendation_label`,
            `restrictions`,
            `allow_support`,
            `allow_create_poll`,
            `allow_submitter_edit`,
            `allow_motion_forwarding`,
            `set_number`,
            `set_created_timestamp`,
            `show_state_extension_field`,
            `merge_amendment_into_final`,
            `show_recommendation_extension_field`,
            `weight`,
            `workflow_id`,
            `next_state_ids`,
            `previous_state_ids`
        ];
        return {
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public getTitle = (viewMotionState: ViewMotionState) => viewMotionState.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Workflows` : `Workflow`);

    public async create(model: Partial<MotionState>): Promise<Identifiable> {
        const payload = {
            workflow_id: model.workflow_id,
            name: model.name,
            ...model
        };
        return this.sendActionToBackend(MotionStateAction.CREATE, payload);
    }

    public async update(update: Partial<MotionState>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            next_state_ids: update.next_state_ids,
            previous_state_ids: update.previous_state_ids,
            ...update
        };
        return this.actions.sendRequest(MotionStateAction.UPDATE, payload);
    }

    public async delete(viewModel: Identifiable): Promise<void> {
        return this.actions.sendRequest(MotionStateAction.DELETE, { id: viewModel.id });
    }

    public async sort(workflowId: number, viewModels: Identifiable[]): Promise<void> {
        return this.actions.sendRequest(MotionStateAction.SORT, {
            workflow_id: workflowId,
            motion_state_ids: viewModels.map(state => state.id)
        });
    }
}
