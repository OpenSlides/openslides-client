import { Injectable } from '@angular/core';

import { MotionWorkflowAction } from 'app/core/actions/motion-workflow-action';
import { ActionType } from 'app/core/core-services/action.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
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
export class MotionWorkflowRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionWorkflow,
    MotionWorkflow
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionWorkflow);
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
     * @returns The workflow states to the given motion
     */
    public getWorkflowStatesForMotions(motions: ViewMotion[]): ViewMotionState[] {
        let states: ViewMotionState[] = [];
        const workflowIds = motions
            .map(motion => motion.workflow_id)
            .filter((value, index, self) => self.indexOf(value) === index);
        workflowIds.forEach(id => {
            const workflow = this.getViewModel(id);
            states = states.concat(workflow.states);
        });
        return states;
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

    public create(partialModel: Partial<MotionWorkflow>): Promise<Identifiable> {
        const payload: MotionWorkflowAction.CreatePayload = {
            name: partialModel.name,
            meeting_id: this.activeMeetingService.meetingId
        };
        return this.sendActionToBackend(ActionType.MOTION_WORKFLOW_CREATE, payload);
    }

    public update(update: Partial<MotionWorkflow>, viewModel: ViewMotionWorkflow): Promise<void> {
        const payload: MotionWorkflowAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            first_state_id: update.first_state_id
        };
        return this.sendActionToBackend(ActionType.MOTION_WORKFLOW_UPDATE, payload);
    }

    public delete(viewModel: ViewMotionWorkflow): Promise<void> {
        return this.sendActionToBackend(ActionType.MOTION_WORKFLOW_DELETE, { id: viewModel.id });
    }
}
