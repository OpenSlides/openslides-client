import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a Motion Submitter.
 *
 * @ignore
 */
export class MotionSubmitter extends BaseModel<MotionSubmitter> {
    public static COLLECTION = 'motion_submitter';

    public id: Id;
    public weight: number;

    public user_id: Id; // user/submitted_motion_$<meeting_id>_ids;
    public motion_id: Id; // motion/submitter_ids;

    public constructor(input?: any) {
        super(MotionSubmitter.COLLECTION, input);
    }
}
export interface MotionSubmitter extends HasMeetingId {}
