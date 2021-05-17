import { Permission } from 'app/core/core-services/permission';
import { HasMeeting, ViewMeeting } from 'app/management/models/view-meeting';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { Group } from 'app/shared/models/users/group';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewUser } from './view-user';

export class ViewGroup extends BaseViewModel<Group> {
    public static COLLECTION = Group.COLLECTION;

    public get group(): Group {
        return this._model;
    }

    public hasPermission(perm: Permission): boolean {
        return this.permissions?.includes(perm);
    }
}
interface IGroupRelations {
    users: ViewUser[];
    default_group_for_meeting: ViewMeeting;
    admin_group_for_meeting: ViewMeeting;
    mediafile_access_groups: ViewMediafile[];
    mediafile_inherited_access_groups: ViewMediafile[];
    read_comment_sections: ViewMotionCommentSection[];
    write_comment_sections: ViewMotionCommentSection[];
    polls: ViewPoll[];
    used_as_motion_poll_default?: ViewMeeting;
    used_as_assignment_poll_default?: ViewMeeting;
}
export interface ViewGroup extends Group, IGroupRelations, HasMeeting {}
