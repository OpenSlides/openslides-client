import { ViewMeeting } from '../../../../../view-models/view-meeting';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMediafile } from '../../../../mediafiles/view-models/view-mediafile';
import { Group } from '../../../../../../../../domain/models/users/group';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { Permission } from '../../../../../../../../domain/definitions/permission';
import { childPermissions } from '../../../../../../../../domain/definitions/permission-children';
import { ViewChatGroup } from '../../../../chat/view-models/view-chat-group';
import { ViewUser } from '../../../../../view-models/view-user';
import { ViewMotionCommentSection } from '../../../../motions/modules/comments/view-models/view-motion-comment-section';
import { ViewPoll } from '../../../../polls/view-models/view-poll';

export class ViewGroup extends BaseViewModel<Group> {
    public static COLLECTION = Group.COLLECTION;

    public get group(): Group {
        return this._model;
    }

    public hasPermission(perm: Permission): boolean {
        return this.permissions?.some(permission => permission === perm || this.hasChildPermission(permission, perm));
    }

    public hasPermissionImplicitly(perm: Permission): boolean {
        return this.permissions?.some(permission => this.hasChildPermission(permission, perm));
    }

    private hasChildPermission(permission: Permission, searchPermission: Permission): boolean {
        if (!childPermissions[permission]) {
            return false;
        }
        return childPermissions[permission]!.includes(searchPermission);
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
