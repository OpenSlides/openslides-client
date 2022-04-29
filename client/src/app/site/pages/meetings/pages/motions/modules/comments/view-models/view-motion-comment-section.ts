import { ViewMotionComment } from './view-motion-comment';
import { MotionCommentSection } from '../../../../../../../../domain/models/motions/motion-comment-section';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { ViewGroup } from '../../../../participants/modules/groups/view-models/view-group';
import { HasMeeting } from '../../../../../view-models/has-meeting';
export class ViewMotionCommentSection extends BaseViewModel<MotionCommentSection> {
    public static COLLECTION = MotionCommentSection.COLLECTION;
    protected _collection = MotionCommentSection.COLLECTION;

    public get section(): MotionCommentSection {
        return this._model;
    }
}

interface IMotionCommentSectionRelations {
    comments: ViewMotionComment[];
    read_groups: ViewGroup[];
    write_groups: ViewGroup[];
}
export interface ViewMotionCommentSection extends MotionCommentSection, IMotionCommentSectionRelations, HasMeeting {}
