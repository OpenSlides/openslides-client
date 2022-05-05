import { MotionComment } from '../../../../../../../../domain/models/motions/motion-comment';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { ViewMotionCommentSection } from './view-motion-comment-section';
export class ViewMotionComment extends BaseViewModel<MotionComment> {
    public static COLLECTION = MotionComment.COLLECTION;
    protected _collection = MotionComment.COLLECTION;

    public get motionComment(): MotionComment {
        return this._model;
    }
}
interface ICommentRelations {
    motion: ViewMotion;
    section: ViewMotionCommentSection;
}
export interface ViewMotionComment extends MotionComment, ICommentRelations, HasMeeting {}
