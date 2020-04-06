import { Group } from 'app/shared/models/users/group';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewUser } from './view-user';

export interface GroupTitleInformation {
    name: string;
}

export class ViewGroup extends BaseViewModel<Group> implements GroupTitleInformation {
    public static COLLECTION = Group.COLLECTION;

    public get group(): Group {
        return this._model;
    }

    public hasPermission(perm: string): boolean {
        return this.permissions.includes(perm);
    }
}
interface IGroupRelations {
    users: ViewUser[];
    mediafile_access_groups: ViewMediafile[];
    read_comment_sections: ViewMotionCommentSection[];
    write_comment_sections: ViewMotionCommentSection[];
    motion_polls: ViewMotionPoll[];
    assignment_polls: ViewAssignmentPoll[];
    used_as_motion_poll_default?: ViewMeeting;
    used_as_assignment_poll_default?: ViewMeeting;
    meeting: ViewMeeting;
}
export interface ViewGroup extends Group, IGroupRelations {}
