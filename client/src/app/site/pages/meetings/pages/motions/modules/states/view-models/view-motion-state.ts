import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { MotionState } from '../../../../../../../../domain/models/motions/motion-state';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';
import { ViewMotionWorkflow } from '../../workflows/view-models/view-motion-workflow';

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
