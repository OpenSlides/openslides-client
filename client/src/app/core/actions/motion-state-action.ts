import { Identifiable } from 'app/shared/models/base/identifiable';
import { MergeAmendment } from 'app/shared/models/motions/motion-state';
import { Id } from '../definitions/key-types';

export namespace MotionStateAction {
    export const CREATE = 'motion_state.create';
    export const UPDATE = 'motion_state.update';
    export const DELETE = 'motion_state.delete';

    export interface CommonPayload {
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

    export interface CreatePayload extends CommonPayload {
        name: string;
        workflow_id: Id;
    }

    export interface UpdatePayload extends Identifiable, CommonPayload {
        // Required
        id: number;

        // Optional
        name?: string;
        next_state_ids?: Id[];
        previous_state_ids?: Id[];
    }

    export interface DeletePayload extends Identifiable {}

    export interface ImportPayload extends CommonPayload {
        name: string;
        next_state_names?: string[];
        previous_state_names?: string[];
    }
}
