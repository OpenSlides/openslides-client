import { MotionSubmitter } from '../../../../../../../../domain/models/motions/motion-submitter';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewUser } from '../../../../../view-models/view-user';
import { ViewMotion } from '../../../view-models/view-motion';
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
export interface ViewMotionSubmitter extends MotionSubmitter, IMotionSubmitterRelations, HasMeeting {}
