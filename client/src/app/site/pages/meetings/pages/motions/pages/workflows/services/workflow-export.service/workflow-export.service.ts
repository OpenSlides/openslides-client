import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import { ViewMotionWorkflow } from 'src/app/site/pages/meetings/pages/motions';

import { MotionStateControllerService } from '../../../../modules/states/services';
import { MotionWorkflowServiceModule } from '../motion-workflow-service.module';

@Injectable({
    providedIn: MotionWorkflowServiceModule
})
export class WorkflowExportService {
    public constructor(private translate: TranslateService, private stateRepo: MotionStateControllerService) {}

    public exportWorkflows(...workflows: ViewMotionWorkflow[]): void {
        const workflowKeysToCopy: (keyof MotionWorkflow)[] = [`name`];
        const stateKeysToCopy: (keyof MotionState)[] = [
            `name`,
            `recommendation_label`,
            `css_class`,
            `restrictions`,
            `allow_support`,
            `allow_create_poll`,
            `allow_submitter_edit`,
            `set_number`,
            `show_state_extension_field`,
            `show_recommendation_extension_field`,
            `merge_amendment_into_final`,
            `weight`,
            `set_workflow_timestamp`,
            `allow_motion_forwarding`
        ];
        const json = [];
        const getNextWorkflowJson = (workflow: ViewMotionWorkflow) => {
            const nextWorkflow = workflowKeysToCopy.mapToObject<any>(key => ({ [key]: workflow[key] }));
            nextWorkflow[`states`] = [];
            for (const state of workflow.states) {
                if (state.id === workflow.first_state_id) {
                    nextWorkflow[`first_state_name`] = state.name;
                }
                const nextState = stateKeysToCopy.mapToObject<any>(key => ({ [key]: state[key] }));
                nextState[`next_state_names`] = (state.next_state_ids || []).map(
                    id => this.stateRepo.getViewModel(id)!.name
                );
                nextState[`previous_state_names`] = (state.previous_state_ids || []).map(
                    id => this.stateRepo.getViewModel(id)!.name
                );
                nextWorkflow[`states`].push(nextState);
            }
            return nextWorkflow;
        };
        for (const workflow of workflows) {
            json.push(getNextWorkflowJson(workflow));
        }
        const blob = new Blob([JSON.stringify(json, undefined, 2)], { type: `application/json` });
        const isMultiple = workflows.length > 1;
        const workflowTranslation = isMultiple
            ? this.translate.instant(`Workflows`)
            : this.translate.instant(`Workflow`);
        const fileName = isMultiple
            ? `${workflowTranslation}.json`
            : `${workflowTranslation}-${workflows[0].name}.json`;
        saveAs(blob, fileName);
    }
}
