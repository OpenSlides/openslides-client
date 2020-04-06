import { BaseModel } from '../base/base-model';

/**
 * Representation of a Motion Submitter.
 *
 * @ignore
 */
export class MotionSubmitter extends BaseModel<MotionSubmitter> {
    public static COLLECTION = 'motion_submitter';

    public id: number;
    public weight: number;

    public user_id: number; // user/submitted_motion_$<meeting_id>_ids;
    public motion_id: number; // motion/submitter_ids;

    public constructor(input?: any) {
        super(MotionSubmitter.COLLECTION, input);
    }
}
