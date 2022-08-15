import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import { Action } from 'src/app/gateways/actions';
import { ViewMotionWorkflow } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets, ROUTING_FIELDSET } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionWorkflowAction } from './motion-workflow.action';

@Injectable({
    providedIn: `root`
})
export class MotionWorkflowRepositoryService extends BaseMeetingRelatedRepository<ViewMotionWorkflow, MotionWorkflow> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionWorkflow);
    }
    public override getFieldsets(): Fieldsets<MotionWorkflow> {
        const routingFields: (keyof MotionWorkflow)[] = [`sequential_number`, `name`];
        const nameFields: (keyof MotionWorkflow)[] = [`name`];
        const listFields: (keyof MotionWorkflow)[] = nameFields.concat([`first_state_id`, `state_ids`]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            [ROUTING_FIELDSET]: routingFields,
            name: nameFields,
            list: listFields
        };
    }

    public getTitle = (viewMotionWorkflow: ViewMotionWorkflow) => viewMotionWorkflow.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Workflows` : `Workflow`);

    public create(partialModel: Partial<MotionWorkflow>): Promise<Identifiable> {
        const payload = {
            name: partialModel.name,
            meeting_id: this.activeMeetingId
        };
        return this.sendActionToBackend(MotionWorkflowAction.CREATE, payload);
    }

    public update(update: Partial<MotionWorkflow>, viewModel: Identifiable): Action<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            first_state_id: update.first_state_id
        };
        return this.createAction(MotionWorkflowAction.UPDATE, payload);
        // return this.sendActionToBackend(MotionWorkflowAction.UPDATE, payload);
    }

    public delete(viewModel: Identifiable): Promise<void> {
        return this.sendActionToBackend(MotionWorkflowAction.DELETE, { id: viewModel.id });
    }

    public async import(workflowJson: any[]): Promise<Identifiable[]> {
        for (const workflow of workflowJson) {
            workflow.meeting_id = this.activeMeetingId;
        }
        return await this.sendBulkActionToBackend(MotionWorkflowAction.IMPORT, workflowJson);
    }
}
