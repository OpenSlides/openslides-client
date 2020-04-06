import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewMotion } from './view-motion';

export class ViewMotionSubmitter extends BaseViewModel<MotionSubmitter> {
    public static COLLECTION = MotionSubmitter.COLLECTION;
    protected _collection = MotionSubmitter.COLLECTION;

    public get motionSubmitter(): MotionSubmitter {
        return this._model;
    }
}
interface IMotionSubmitterRelations {
    user: ViewUser;
    motion: ViewMotion;
}
export interface ViewMotionSubmitter extends MotionSubmitter, IMotionSubmitterRelations {}
