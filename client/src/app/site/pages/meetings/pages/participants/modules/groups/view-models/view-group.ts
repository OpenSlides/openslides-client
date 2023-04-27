import { Permission } from '../../../../../../../../domain/definitions/permission';
import { permissionChildren } from '../../../../../../../../domain/definitions/permission-relations';
import { Group } from '../../../../../../../../domain/models/users/group';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMeeting } from '../../../../../view-models/view-meeting';
import { ViewUser } from '../../../../../view-models/view-user';
import { ViewChatGroup } from '../../../../chat/view-models/view-chat-group';
import { ViewMediafile } from '../../../../mediafiles/view-models/view-mediafile';
import { ViewMotionCommentSection } from '../../../../motions/modules/comments/view-models/view-motion-comment-section';
import { ViewPoll } from '../../../../polls/view-models/view-poll';

export class ViewGroup extends BaseViewModel<Group> {
    public static COLLECTION = Group.COLLECTION;

    public get group(): Group {
        return this._model;
    }

    public hasPermission(perm: Permission): boolean {
        return this.permissions?.some(
            permission => permission === perm || permissionChildren[permission]?.includes(perm)
        );
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
    read_chat_groups: ViewChatGroup[];
    write_chat_groups: ViewChatGroup[];
    polls: ViewPoll[];
    used_as_motion_poll_default?: ViewMeeting;
    used_as_assignment_poll_default?: ViewMeeting;
}
export interface ViewGroup extends Group, IGroupRelations, HasMeeting {}
