import { MotionCommentSection } from '../../../../../../../../domain/models/motions/motion-comment-section';
import { BaseViewModel, ViewModelRelations } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewGroup } from '../../../../participants/modules/groups/view-models/view-group';
import { ViewMotionComment } from './view-motion-comment';
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
export interface ViewMotionCommentSection
    extends MotionCommentSection, ViewModelRelations<IMotionCommentSectionRelations>, HasMeeting {}
