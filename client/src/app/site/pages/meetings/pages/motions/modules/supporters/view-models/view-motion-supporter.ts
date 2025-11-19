import { MotionSupporter } from 'src/app/domain/models/motions/motion-supporter';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';

export class ViewMotionSupporter extends BaseHasMeetingUserViewModel<MotionSupporter> {
    public static COLLECTION = MotionSupporter.COLLECTION;
    protected _collection = MotionSupporter.COLLECTION;

    public get motionSupporter(): MotionSupporter {
        return this._model;
    }
}
interface IMotionSupporterRelations {
    motion: ViewMotion;
}
export interface ViewMotionSupporter
    extends MotionSupporter,
        ViewModelRelations<IMotionSupporterRelations>,
        HasMeeting {}
