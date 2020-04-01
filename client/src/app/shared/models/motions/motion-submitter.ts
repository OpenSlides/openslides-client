import { BaseModel } from '../base/base-model';

/**
 * Representation of a Motion Submitter.
 *
 * @ignore
 */
export class MotionSubmitter extends BaseModel {
    public static COLLECTION = 'motion_submitter';

    public id: number;
    public user_id: number;
    public motion_id: number;
    public weight: number;

    public constructor(input?: any) {
        super(MotionSubmitter.COLLECTION, input);
    }
}
