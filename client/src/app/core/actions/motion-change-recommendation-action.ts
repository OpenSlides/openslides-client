import { Identifiable } from 'app/shared/models/base/identifiable';

import { Id, UnsafeHtml } from '../definitions/key-types';
import { ModificationType } from '../ui-services/diff.service';

export namespace MotionChangeRecommendationAction {
    export const CREATE = `motion_change_recommendation.create`;
    export const UPDATE = `motion_change_recommendation.update`;
    export const DELETE = `motion_change_recommendation.delete`;

    interface MotionChangeRecommendationAttributes {
        rejected?: boolean;
        internal?: boolean;
        type?: ModificationType;
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

    export interface DeletePayload extends Identifiable {}
}
