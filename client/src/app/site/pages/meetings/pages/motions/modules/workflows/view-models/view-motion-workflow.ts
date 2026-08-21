import { MotionWorkflow } from '@app/domain/models/motions/motion-workflow';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';
import { ViewMotionState } from '@app/site/pages/meetings/pages/motions';
import { HasMeeting } from '@app/site/pages/meetings/view-models/has-meeting';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';

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
}
export interface ViewMotionWorkflow extends MotionWorkflow, ViewModelRelations<IWorkflowRelations>, HasMeeting {}
