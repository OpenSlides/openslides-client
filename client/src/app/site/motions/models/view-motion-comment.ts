import { HasMeeting } from 'app/management/models/view-meeting';
import { MotionComment } from 'app/shared/models/motions/motion-comment';

import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';
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
