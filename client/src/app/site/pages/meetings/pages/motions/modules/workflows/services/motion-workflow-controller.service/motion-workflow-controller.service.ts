import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { MotionWorkflow } from '@app/domain/models/motions/motion-workflow';
import { Action } from '@app/gateways/actions';
import { MotionWorkflowRepositoryService } from '@app/gateways/repositories/motions';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotion } from '../../../../view-models';
import { ViewMotionState } from '../../../states';
import { ViewMotionWorkflow } from '../../view-models';

@Service()
export class MotionWorkflowControllerService extends BaseMeetingControllerService<ViewMotionWorkflow, MotionWorkflow> {
    protected override repo: MotionWorkflowRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionWorkflowRepositoryService);
        super(controllerServiceCollector, MotionWorkflow, repo);
    }

    public create(workflow: Partial<MotionWorkflow>): Promise<Identifiable> {
        return this.repo.create(workflow);
    }

    public update(update: Partial<MotionWorkflow>, workflow: Identifiable): Action<void> {
        return this.repo.update(update, workflow);
    }

    public delete(workflow: Identifiable): Promise<void> {
        return this.repo.delete(workflow);
    }

    public import(file: any[]): Promise<Identifiable[]> {
        return this.repo.import(file);
    }

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

    public getWorkflowByStateId(stateId: Id): ViewMotionWorkflow | undefined {
        return this.getViewModelList().find(workflow => workflow.state_ids.includes(stateId));
    }
}
