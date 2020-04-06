import { MotionCommentSection } from 'app/shared/models/motions/motion-comment-section';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewGroup } from 'app/site/users/models/view-group';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotionComment } from './view-motion-comment';

export interface MotionCommentSectionTitleInformation {
    name: string;
}

/**
 * Motion comment section class for the View
 *
 * Stores a motion comment section including all (implicit) references
 * Provides "safe" access to variables and functions in {@link MotionCommentSection}
 * @ignore
 */
export class ViewMotionCommentSection extends BaseViewModel<MotionCommentSection>
    implements MotionCommentSectionTitleInformation {
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
    meeting: ViewMeeting;
}
export interface ViewMotionCommentSection extends MotionCommentSection, IMotionCommentSectionRelations {}
