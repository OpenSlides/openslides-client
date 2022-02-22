import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of user group.
 * @ignore
 */
export class Group extends BaseModel<Group> {
    public static COLLECTION = `group`;

    public id: Id;
    public name: string;
    public weight: number;
    public permissions: Permission[];

    public user_ids: Id[]; // (user/group_$<meeting_id>_ids)[];
    public default_group_for_meeting_id: Id; // meeting/default_group_id;
    public admin_group_for_meeting_id: Id; // meeting/admin_group_id;
    public mediafile_access_group_ids: Id[]; // (mediafile/access_group_ids)[];
    public mediafile_inherited_access_group_ids: Id[]; // (mediafile/inherited_access_group_ids)[];
    public read_comment_section_ids: Id[]; // (motion_comment_section/read_group_ids)[];
    public write_comment_section_ids: Id[]; // (motion_comment_section/write_group_ids)[];
    public read_chat_group_ids: Id[]; // (chat_group/read_group_ids)[];
    public write_chat_group_ids: Id[]; // (chat_group/write_group_ids)[];
    public motion_poll_ids: Id[]; // (motion_poll/entitled_group_ids)[];
    public assignment_poll_ids: Id[]; // (assignment_poll/entitled_group_ids)[];
    public used_as_motion_poll_default_id: Id; // meeting/motion_poll_default_group_ids;
    public used_as_assignment_poll_default_id: Id; // meeting/assignment_poll_default_group_ids;

    public get isAdminGroup(): boolean {
        return !!this.admin_group_for_meeting_id;
    }

    public get isDefaultGroup(): boolean {
        return !!this.default_group_for_meeting_id;
    }

    public constructor(input?: Partial<Group>) {
        super(Group.COLLECTION, input);
    }
}
export interface Group extends HasMeetingId {}
