import { Permission } from 'app/core/core-services/permission';
import { childPermissions } from 'app/core/core-services/permission-children';
import { HasMeeting, ViewMeeting } from 'app/management/models/view-meeting';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { Group } from 'app/shared/models/users/group';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';

import { ViewChatGroup } from '../../../shared/models/chat/chat-groups/view-chat-group';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewUser } from './view-user';

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
        return childPermissions[permission].includes(searchPermission);
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
