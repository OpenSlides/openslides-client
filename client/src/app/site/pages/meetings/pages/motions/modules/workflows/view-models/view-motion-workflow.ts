import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewMotionState } from 'src/app/site/pages/meetings/pages/motions';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

export class ViewMotionWorkflow extends BaseViewModel<MotionWorkflow> {
    public static COLLECTION = MotionWorkflow.COLLECTION;
    protected _collection = MotionWorkflow.COLLECTION;

    public get workflow(): MotionWorkflow {
        return this._model;
    }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/motions/workflows/${this.sequential_number}`;
    }
}
interface IWorkflowRelations {
    states: ViewMotionState[];
    first_state: ViewMotionState;
    default_workflow_meeting?: ViewMeeting;
    default_amendment_workflow_meeting?: ViewMeeting;
    default_statute_amendment_workflow_meeting?: ViewMeeting;
}
export interface ViewMotionWorkflow extends MotionWorkflow, IWorkflowRelations, HasMeeting {}
