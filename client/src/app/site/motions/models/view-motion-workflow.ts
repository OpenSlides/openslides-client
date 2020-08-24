import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';
import { ViewMotionState } from './view-motion-state';

/**
 * class for the ViewWorkflow.
 * @ignore
 */
export class ViewMotionWorkflow extends BaseViewModel<MotionWorkflow> {
    public static COLLECTION = MotionWorkflow.COLLECTION;
    protected _collection = MotionWorkflow.COLLECTION;

    public get workflow(): MotionWorkflow {
        return this._model;
    }
}
interface IWorkflowRelations {
    states: ViewMotionState[];
    first_state: ViewMotionState;
    motions: ViewMotion[];
    default_workflow_meeting?: ViewMeeting;
    default_amendment_workflow_meeting?: ViewMeeting;
    default_statute_amendment_workflow_meeting?: ViewMeeting;
    meeting: ViewMeeting;
}
export interface ViewMotionWorkflow extends MotionWorkflow, IWorkflowRelations {}
