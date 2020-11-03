import { Injectable } from '@angular/core';

import { MotionWorkflowAction } from 'app/core/actions/motion-workflow-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for Workflows
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionWorkflowRepositoryService
    extends BaseRepositoryWithActiveMeeting<ViewMotionWorkflow, MotionWorkflow>
    implements ModelRequestRepository {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionWorkflow);
    }

    public getFieldsets(): Fieldsets<MotionWorkflow> {
        const nameFields: (keyof MotionWorkflow)[] = ['name'];
        const listFields: (keyof MotionWorkflow)[] = nameFields;
        return {
            [DEFAULT_FIELDSET]: listFields,
            name: nameFields,
            list: listFields
        };
    }

    public getTitle = (viewMotionWorkflow: ViewMotionWorkflow) => {
        return viewMotionWorkflow.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Workflows' : 'Workflow');
    };

    /**
     * Returns all workflowStates that cover the list of viewMotions given
     *
     * @param motions The motions to get the workflows from
     *
     * @returns The workflow states to the given motion
     */
    public getWorkflowStatesForMotions(motions: ViewMotion[]): ViewMotionState[] {
        let states: ViewMotionState[] = [];
        const workflowIds = motions
            .map(motion => motion.state?.workflow_id)
            .filter((value, index, self) => self.indexOf(value) === index);
        workflowIds.forEach(id => {
            const workflow = this.getViewModel(id);
            states = states.concat(workflow.states);
        });
        return states;
    }

    public getWorkflowByStateId(stateId: Id): ViewMotionWorkflow {
        return this.getViewModelList().find(workflow => workflow.state_ids.includes(stateId));
    }

    public create(partialModel: Partial<MotionWorkflow>): Promise<Identifiable> {
        const payload: MotionWorkflowAction.CreatePayload = {
            name: partialModel.name,
            meeting_id: this.activeMeetingIdService.meetingId
        };
        return this.sendActionToBackend(MotionWorkflowAction.CREATE, payload);
    }

    public update(update: Partial<MotionWorkflow>, viewModel: ViewMotionWorkflow): Promise<void> {
        const payload: MotionWorkflowAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            first_state_id: update.first_state_id
        };
        return this.sendActionToBackend(MotionWorkflowAction.UPDATE, payload);
    }

    public delete(viewModel: ViewMotionWorkflow): Promise<void> {
        return this.sendActionToBackend(MotionWorkflowAction.DELETE, { id: viewModel.id });
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_workflow_ids'
                }
            ]
        };
    }
}
