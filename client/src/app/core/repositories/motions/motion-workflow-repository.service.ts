import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import { MotionWorkflowAction } from 'app/core/actions/motion-workflow-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { MotionState } from '../../../shared/models/motions/motion-state';
import { MotionStateRepositoryService } from './motion-state-repository.service';

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
    implements ModelRequestRepository
{
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private stateRepo: MotionStateRepositoryService
    ) {
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

    public getTitle = (viewMotionWorkflow: ViewMotionWorkflow) => viewMotionWorkflow.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? 'Workflows' : 'Workflow');

    /**
     * Returns all workflowStates that cover the list of viewMotions given
     *
     * @param motions The motions to get the workflows from
     *
     * @returns The workflow states to the given motion
     */
    public getWorkflowStatesForMotions(motions: ViewMotion[]): ViewMotionState[] {
        const workflows: ViewMotionWorkflow[] = [];
        for (const motion of motions) {
            const motionState = motion.state;
            if (motionState && workflows.indexOf(motionState.workflow) === -1) {
                workflows.push(motionState.workflow);
            }
        }
        return workflows.flatMap((workflow: ViewMotionWorkflow) => workflow.states);
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

    public exportWorkflows(...workflows: ViewMotionWorkflow[]): void {
        const workflowKeysToCopy: (keyof MotionWorkflow)[] = ['name'];
        const stateKeysToCopy: (keyof MotionState)[] = [
            'name',
            'recommendation_label',
            'css_class',
            'restrictions',
            'allow_support',
            'allow_create_poll',
            'allow_submitter_edit',
            'set_number',
            'show_state_extension_field',
            'show_recommendation_extension_field',
            'merge_amendment_into_final',
            'weight'
        ];
        const json = [];
        const getNextWorkflowJson = (workflow: ViewMotionWorkflow) => {
            const nextWorkflow = workflowKeysToCopy.mapToObject(key => ({ [key]: workflow[key] }));
            nextWorkflow.states = [];
            for (const state of workflow.states) {
                if (state.id === workflow.first_state_id) {
                    nextWorkflow.first_state_name = state.name;
                }
                const nextState = stateKeysToCopy.mapToObject(key => ({ [key]: state[key] }));
                nextState.next_state_names = (state.next_state_ids || []).map(
                    id => this.stateRepo.getViewModel(id).name
                );
                nextState.previous_state_names = (state.previous_state_ids || []).map(
                    id => this.stateRepo.getViewModel(id).name
                );
                nextWorkflow.states.push(nextState);
            }
            return nextWorkflow;
        };
        for (const workflow of workflows) {
            json.push(getNextWorkflowJson(workflow));
        }
        const blob = new Blob([JSON.stringify(json, undefined, 2)], { type: 'application/json' });
        const isMultiple = workflows.length > 1;
        const workflowTranslation = isMultiple
            ? this.translate.instant('Workflows')
            : this.translate.instant('Workflow');
        const fileName = isMultiple
            ? `${workflowTranslation}.json`
            : `${workflowTranslation}-${this.translate.instant(workflows[0].name)}.json`;
        saveAs(blob, fileName);
    }

    public async import(workflowJson: MotionWorkflowAction.ImportPayload[]): Promise<Identifiable[]> {
        for (const workflow of workflowJson) {
            workflow.meeting_id = this.activeMeetingId;
        }
        return await this.sendBulkActionToBackend(MotionWorkflowAction.IMPORT, workflowJson);
    }
}
