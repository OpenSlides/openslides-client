import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseSortPayload } from './common/base-sort-payload';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionAction {
    export const DELETE = 'motion.delete';
    export const FOLLOW_RECOMMENDATION = 'motion.follow_recommendation';

    interface OptionalPayload {
        state_extension?: string;
        category_id?: Id;
        block_id?: Id;
        supporter_ids?: Id[]; // user ids
        tag_ids?: Id[];
        attachment_ids?: Id[];
    }

    export interface CreatePayload extends HasMeetingId, OptionalPayload {
        // Required
        title: string;
        meeting_id: Id;

        // Optional
        number?: string;
        sort_parent_id?: Id;

        // Special logic: If lead_motion_id is given, it is an amendment.
        // Either text or amendment_paragraph_* must be set. Text must be set (required!),
        // if either lead_motion_id is not given or statute_paragraph_id is given. But I'm not sure here.
        text: UnsafeHtml;
        amendment_paragraph?: UnsafeHtml;
        // lead_motion_id?: Id;
        statute_paragraph_id?: Id;
        reason?: UnsafeHtml; // is required, if special settings are set
        origin_id: Id;

        // Special field, not in model
        workflow_id: Id;

        // Special field: The content is different as retrieving a mtion
        submitter_ids: Id[]; // User ids!!! Not the motion_submitter through-model ids!!!

        // Non-model fields for customizing the agenda item creation, optional
        agenda_create: boolean;
        agenda_type: number;
        agenda_parent_id: number;
        agenda_comment: string;
        agenda_duration: number;
        agenda_weight: number;
    }
    export interface UpdatePayload extends Identifiable {
        // Optional
        title?: string;
        number?: string;
        text?: string;
        reason?: string;
        amendment_paragraph?: string;
        modified_final_version?: string;
    }
    export interface UpdateMetadataPayload extends Identifiable, OptionalPayload {
        // Optional
        recommendation_extension: string;
    }

    export interface SetRecommendationPayload extends Identifiable {
        recommendation_id: Id;
    }
    export interface ResetRecommendationPayload extends Identifiable {}
    export interface SetStatePayload extends Identifiable {
        state_id: Id;
    }
    export interface ResetStatePayload extends Identifiable {}
    export interface SortPayload extends HasMeetingId, BaseSortPayload {}
    export interface FollowRecommendationPayload extends Identifiable {}
}
