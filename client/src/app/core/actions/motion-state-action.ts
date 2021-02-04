import { Identifiable } from 'app/shared/models/base/identifiable';
import { MergeAmendment } from 'app/shared/models/motions/motion-state';
import { Id } from '../definitions/key-types';

export namespace MotionStateAction {
    export const CREATE = 'motion_state.create';
    export const UPDATE = 'motion_state.update';
    export const DELETE = 'motion_state.delete';

    export interface CreatePayload {
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
        merge_amendment_into_final?: MergeAmendment;
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
        merge_amendment_into_final?: MergeAmendment;
        show_recommendation_extension_field?: boolean;
        next_state_ids?: Id[];
        previous_state_ids?: Id[];
    }

    export interface DeletePayload extends Identifiable {}
}
