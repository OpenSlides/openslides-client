import { MotionWorkflow } from 'app/shared/models/motions/motion-workflow';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotionState } from './view-motion-state';

export interface WorkflowTitleInformation {
    name: string;
}

/**
 * class for the ViewWorkflow.
 * @ignore
 */
export class ViewMotionWorkflow extends BaseViewModel<MotionWorkflow> implements WorkflowTitleInformation {
    public static COLLECTION = MotionWorkflow.COLLECTION;
    protected _collection = MotionWorkflow.COLLECTION;

    public get workflow(): MotionWorkflow {
        return this._model;
    }
}
interface IWorkflowRelations {
    states?: ViewMotionState[];
    first_state?: ViewMotionState;
}
export interface ViewMotionWorkflow extends MotionWorkflow, IWorkflowRelations {}
