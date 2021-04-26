import { AgendaItemCreationPayload } from './common/agenda-item-creation-payload';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseSortPayload } from './common/base-sort-payload';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace MotionAction {
    export const CREATE = 'motion.create';
    export const UPDATE = 'motion.update';
    export const DELETE = 'motion.delete';
    export const CREATE_FORWARDED = 'motion.create_forwarded';
    export const SORT = 'motion.sort';
    export const SET_STATE = 'motion.set_state';
    export const RESET_STATE = 'motion.reset_state';
    export const SET_RECOMMENDATION = 'motion.set_recommendation';
    export const RESET_RECOMMENDATION = 'motion.reset_recommendation';
    export const FOLLOW_RECOMMENDATION = 'motion.follow_recommendation';

    interface OptionalPayload {
        number?: string;
        state_extension?: string;
        recommendation_extension?: string;
        category_id?: Id;
        block_id?: Id;
        supporter_ids?: Id[]; // user ids
        tag_ids?: Id[];
        attachment_ids?: Id[];
        // Special field, not in model
        workflow_id?: Id;
    }

    export interface PartialMotionCreatePayload extends HasMeetingId, OptionalPayload, AgendaItemCreationPayload {
        // Required
        title: string;

        // Optional
        sort_parent_id?: Id;

        reason?: UnsafeHtml; // is required, if special settings are set
        origin_id?: Id;

        // Special field: The content is different as retrieving a mtion
        submitter_ids?: Id[]; // User ids!!! Not the motion_submitter through-model ids!!!
    }

    export interface CreatePayload extends PartialMotionCreatePayload {
        // Special logic: If lead_motion_id is given, it is an amendment.
        // Either text or amendment_paragraph_* must be set. Text must be set (required!),
        // if either lead_motion_id is not given or statute_paragraph_id is given. But I'm not sure here.
        text: UnsafeHtml;
    }

    export interface UpdatePayload extends Identifiable, OptionalPayload {
        // Optional
        title?: string;
        text?: string;
        reason?: string;
        amendment_paragraphs?: { [paragraphNumber: number]: string };
        modified_final_version?: string;
    }

    export interface DeletePayload extends Identifiable {}

    export interface CreateForwardedPayload extends HasMeetingId {
        title: string;
        text: UnsafeHtml;
        origin_id: Id;
        reason?: UnsafeHtml;
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
