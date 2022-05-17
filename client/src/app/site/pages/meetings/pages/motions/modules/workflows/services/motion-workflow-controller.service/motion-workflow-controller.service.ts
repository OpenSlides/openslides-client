import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MotionWorkflowCommonServiceModule } from '../../motion-workflow-common-service.module';
import { ViewMotionWorkflow } from '../../view-models';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { MotionWorkflowRepositoryService } from 'src/app/gateways/repositories/motions';
import { ViewMotion } from '../../../../view-models';
import { ViewMotionState } from '../../../states';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';

@Injectable({
    providedIn: `root`
})
export class MotionWorkflowControllerService extends BaseMeetingControllerService<ViewMotionWorkflow, MotionWorkflow> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionWorkflowRepositoryService
    ) {
        super(controllerServiceCollector, MotionWorkflow, repo);
    }

    public create(workflow: Partial<MotionWorkflow>): Promise<Identifiable> {
        return this.repo.create(workflow);
    }

    public update(update: Partial<MotionWorkflow>, workflow: Identifiable): Promise<void> {
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
