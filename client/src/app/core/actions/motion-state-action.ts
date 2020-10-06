import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionStateAction {
    export interface CreatePayload extends HasMeetingId {
        name: string;
        workflow_id: Id;

        // Optional
        recommendation_label?: string;
        css_class?: string;
        restrictions?: string[];
        allow_support?: boolean;
        allow_create_poll?: boolean;
        allow_submitter_edit?: boolean;
        set_number?: boolean;
        show_state_extension_field?: boolean;
        merge_amendment_into_final?: number;
        show_recommendation_extension_field?: boolean;
    }

    export interface UpdatePayload extends Identifiable {
        // Required
        id: number;

        // Optional
        name?: string;
        recommendation_label?: string;
        css_class?: string;
        restrictions?: string[];
        allow_support?: boolean;
        allow_create_poll?: boolean;
        allow_submitter_edit?: boolean;
        set_number?: boolean;
        show_state_extension_field?: boolean;
        merge_amendment_into_final?: number;
        show_recommendation_extension_field?: boolean;
        next_state_ids?: Id[];
        previous_state_ids?: Id[];
    }
}
