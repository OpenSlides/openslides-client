import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a comment section.
 * @ignore
 */
export class MotionCommentSection extends BaseModel<MotionCommentSection> {
    public static COLLECTION = `motion_comment_section`;

    public id: Id;
    public name: string;
    public weight: number;

    public comment_ids: Id[]; // (motion_comment/section_id)[];
    public read_group_ids: Id[]; // (group/read_comment_section_ids)[];
    public write_group_ids: Id[]; // (group/write_comment_section_ids)[];

    public constructor(input?: any) {
        super(MotionCommentSection.COLLECTION, input);
    }
}
export interface MotionCommentSection extends HasMeetingId {}
