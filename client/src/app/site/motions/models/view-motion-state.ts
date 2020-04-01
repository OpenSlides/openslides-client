import { MotionState } from 'app/shared/models/motions/motion-state';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotionWorkflow } from './view-motion-workflow';

export interface StateTitleInformation {
    name: string;
}

/**
 * class for the ViewState.
 * @ignore
 */
export class ViewMotionState extends BaseViewModel<MotionState> implements StateTitleInformation {
    public static COLLECTION = MotionState.COLLECTION;
    protected _collection = MotionState.COLLECTION;

    public get state(): MotionState {
        return this._model;
    }

    public get isFinalState(): boolean {
        return (
            !this.next_states_id ||
            !this.next_states_id.length ||
            (this.next_states_id.length === 1 && this.next_states_id[0] === 0)
        );
    }
}

interface IStateRelations {
    next_states?: ViewMotionState[];
    previous_states?: ViewMotionState[];
    workflow?: ViewMotionWorkflow;
}
export interface ViewMotionState extends MotionState, IStateRelations {}
