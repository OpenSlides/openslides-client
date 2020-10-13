import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { UnsafeHtml, Id } from '../definitions/key-types';

export namespace AssignmentAction {
    export interface CreatePayload extends HasMeetingId {
        // Required
        title: string;

        // Optional
        description?: UnsafeHtml;
        open_posts?: number;
        phase?: number;
        default_poll_description?: string;
        number_poll_candidates?: boolean;
        tag_ids?: Id[];
        attachment_ids?: Id[];
    }
    export interface UpdatePayload extends Identifiable {
        // Optional
        title?: string;
        description?: UnsafeHtml;
        open_posts?: number;
        phase?: number;
        default_poll_description?: string;
        number_poll_candidates?: boolean;

        tag_ids?: Id[];
        attachment_ids?: Id[];
    }
    export interface WithdrawSelfPayload extends Identifiable {}
    export interface WithdrawOtherPayload extends Identifiable {
        user_id: Id;
    }
    export interface NominateSelfPayload extends Identifiable {}
    export interface NominateOtherPayload extends Identifiable {
        user_id: Id;
    }
    export interface SortCandidatesPayload extends Identifiable {
        candidate_ids: Id[];
    }
}
