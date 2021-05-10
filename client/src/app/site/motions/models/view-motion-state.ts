import { HasMeeting } from 'app/management/models/view-meeting';
import { MotionState } from 'app/shared/models/motions/motion-state';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';
import { ViewMotionWorkflow } from './view-motion-workflow';

/**
 * class for the ViewState.
 * @ignore
 */
export class ViewMotionState extends BaseViewModel<MotionState> {
    public static COLLECTION = MotionState.COLLECTION;
    protected _collection = MotionState.COLLECTION;

    public get state(): MotionState {
        return this._model;
    }

    public get isFinalState(): boolean {
        return !this.next_state_ids || !this.next_state_ids.length;
    }
}
interface IStateRelations {
    next_states: ViewMotionState[];
    previous_states: ViewMotionState[];
    motions: ViewMotion[];
    motion_recommendations: ViewMotion[];
    workflow: ViewMotionWorkflow;
    first_state_of_workflow?: ViewMotionWorkflow;
}
export interface ViewMotionState extends MotionState, IStateRelations, HasMeeting {}
