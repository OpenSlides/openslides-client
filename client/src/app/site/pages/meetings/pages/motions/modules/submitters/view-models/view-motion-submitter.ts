import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { MotionSubmitter } from '../../../../../../../../domain/models/motions/motion-submitter';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';

export class ViewMotionSubmitter extends BaseHasMeetingUserViewModel<MotionSubmitter> {
    public static COLLECTION = MotionSubmitter.COLLECTION;
    protected _collection = MotionSubmitter.COLLECTION;

    public get motionSubmitter(): MotionSubmitter {
        return this._model;
    }
}
interface IMotionSubmitterRelations {
    motion: ViewMotion;
}
export interface ViewMotionSubmitter extends MotionSubmitter, IMotionSubmitterRelations, HasMeeting {}
