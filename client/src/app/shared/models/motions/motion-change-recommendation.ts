import { Id } from 'app/core/definitions/key-types';
import { ModificationType } from 'app/core/ui-services/diff.service';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a motion change recommendation.
 * @ignore
 */
export class MotionChangeRecommendation extends BaseModel<MotionChangeRecommendation> {
    public static COLLECTION = `motion_change_recommendation`;

    public id: Id;
    public rejected: boolean;
    public internal: boolean;
    public type: ModificationType;
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
export interface MotionChangeRecommendation extends HasMeetingId {}
