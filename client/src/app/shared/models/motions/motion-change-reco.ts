import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion change recommendation.
 * @ignore
 */
export class MotionChangeRecommendation extends BaseModel<MotionChangeRecommendation> {
    public static COLLECTION = 'motion_change_recommendation';

    public id: Id;
    public rejected: boolean;
    public internal: boolean;
    public type: number;
    public other_description: string;
    public line_from: number;
    public line_to: number;
    public text: string;
    public creation_time: string;

    public motion_id: Id; // motion/change_recommendation_ids;

    public constructor(input?: any) {
        super(MotionChangeRecommendation.COLLECTION, input);
    }
}
