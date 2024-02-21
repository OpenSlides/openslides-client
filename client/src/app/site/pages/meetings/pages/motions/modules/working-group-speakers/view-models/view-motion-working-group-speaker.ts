import { MotionWorkingGroupSpeaker } from 'src/app/domain/models/motions/motion-working-group-speaker';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';

export class ViewMotionWorkingGroupSpeaker extends BaseHasMeetingUserViewModel<MotionWorkingGroupSpeaker> {
    public static COLLECTION = MotionWorkingGroupSpeaker.COLLECTION;
    protected _collection = MotionWorkingGroupSpeaker.COLLECTION;

    public get motionWorkingGroupSpeaker(): MotionWorkingGroupSpeaker {
        return this._model;
    }
}
interface IMotionWorkingGroupSpeakerRelations {
    motion: ViewMotion;
}
export interface ViewMotionWorkingGroupSpeaker
    extends MotionWorkingGroupSpeaker,
        IMotionWorkingGroupSpeakerRelations,
        HasMeeting {}
