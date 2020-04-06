import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of user group.
 * @ignore
 */
export class Group extends BaseModel<Group> {
    public static COLLECTION = 'group';

    public id: Id;
    public name: string;
    public is_superadmin_group: boolean;
    public is_default_group: boolean;
    public permissions: string[];

    public user_ids: Id[]; // (user/group_$<meeting_id>_ids)[];
    public mediafile_access_group_ids: Id[]; // (mediafile/access_group_ids)[];
    public read_comment_section_ids: Id[]; // (motion_comment_section/read_group_ids)[];
    public write_comment_section_ids: Id[]; // (motion_comment_section/write_group_ids)[];
    public motion_poll_ids: Id[]; // (motion_poll/entitled_group_ids)[];
    public assignment_poll_ids: Id[]; // (assignment_poll/entitled_group_ids)[];
    public used_as_motion_poll_default_id: Id; // meeting/motion_poll_default_group_ids;
    public used_as_assignment_poll_default_id: Id; // meeting/assignment_poll_default_group_ids;
    public meeting_id: Id; // meeting/group_ids;

    public constructor(input?: Partial<Group>) {
        super(Group.COLLECTION, input);
    }
}
