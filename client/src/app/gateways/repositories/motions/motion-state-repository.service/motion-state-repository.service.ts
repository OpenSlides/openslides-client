import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { Action } from 'src/app/gateways/actions';
import { ViewMotionState } from 'src/app/site/pages/meetings/pages/motions';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionStateAction } from './motion-state.action';

@Injectable({
    providedIn: `root`
})
export class MotionStateRepositoryService extends BaseMeetingRelatedRepository<ViewMotionState, MotionState> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionState);
    }

    public getTitle = (viewMotionState: ViewMotionState) => viewMotionState.name;

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Workflows` : `Workflow`);

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
        await this.createAction(MotionStateAction.UPDATE, payload).resolve();
    }

    public async delete(viewModel: Identifiable): Promise<void> {
        await this.createAction(MotionStateAction.DELETE, { id: viewModel.id }).resolve();
    }

    public sort(workflowId: number, viewModels: Identifiable[]): Action<void> {
        return this.actions.create({
            action: MotionStateAction.SORT,
            data: [
                {
                    workflow_id: workflowId,
                    motion_state_ids: viewModels.map(state => state.id)
                }
            ]
        });
    }
}
