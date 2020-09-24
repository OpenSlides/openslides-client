import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionChangeRecommendationAction {
    interface MotionChangeRecommendationAttributes {
        rejected?: boolean;
        internal?: boolean;
        type?: number;
        other_description?: string;
    }
    export interface CreatePayload extends MotionChangeRecommendationAttributes {
        // Required
        line_from: number;
        line_to: number;
        text: UnsafeHtml;
        motion_id: Id;
    }
    export interface UpdatePayload extends Identifiable, MotionChangeRecommendationAttributes {
        // Optional
        text?: UnsafeHtml;
    }
}
