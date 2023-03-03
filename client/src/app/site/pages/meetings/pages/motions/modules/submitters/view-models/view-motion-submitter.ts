import { applyMixins } from 'src/app/infrastructure/utils';
import { HasMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { MotionSubmitter } from '../../../../../../../../domain/models/motions/motion-submitter';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';
export class ViewMotionSubmitter extends BaseViewModel<MotionSubmitter> {
    public static COLLECTION = MotionSubmitter.COLLECTION;
    protected _collection = MotionSubmitter.COLLECTION;

    public get motionSubmitter(): MotionSubmitter {
        return this._model;
    }
}
interface IMotionSubmitterRelations {
    motion: ViewMotion;
}
export interface ViewMotionSubmitter extends MotionSubmitter, IMotionSubmitterRelations, HasMeeting, HasMeetingUser {}
applyMixins(MotionSubmitter, [HasMeetingUser]);
