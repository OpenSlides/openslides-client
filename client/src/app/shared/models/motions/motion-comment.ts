import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion workflow. Has the nested property 'states'
 * @ignore
 */
export class MotionComment extends BaseModel<MotionComment> {
    public static COLLECTION = 'motion_comment';

    public id: Id;
    public comment: string;

    public motion_id: Id; // motion/comment_ids;
    public section_id: Id; // motion_comment_section/comment_ids;

    public constructor(input?: any) {
        super(MotionComment.COLLECTION, input);
    }
}
