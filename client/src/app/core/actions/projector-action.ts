import { Identifiable } from 'app/shared/models/base/identifiable';
import { Fqid, Id } from '../definitions/key-types';

/**
 * Directions for scale and scroll requests.
 */
export enum ScrollScaleDirection {
    Up = 'up',
    Down = 'down',
    Reset = 'reset'
}

export namespace ProjectorAction {
    export const CREATE = 'projector.create';
    export const UPDATE = 'projector.update';
    export const DELETE = 'projector.delete';
    export const CONTROL_VIEW = 'projector.control_view';
    export const PROJECT = 'projector.project';
    export const NEXT = 'projector.next';
    export const PREVIOUS = 'projector.previous';
    export const ADD_TO_PREVIEW = 'projector.add_to_preview';
    export const PROJECT_PREVIEW = 'projector.project_preview';
    export const SORT_PREVIEW = 'projector.sort_preview';

    export interface PartialPayload {
        width?: number;
        aspect_ratio_numerator?: number;
        aspect_ratio_denominator?: number;
        color?: string;
        background_color?: string;
        header_background_color?: string;
        header_font_color?: string;
        header_h1_color?: string;
        chyron_background_color?: string;
        chyron_font_color?: string;
        show_header_footer?: boolean;
        show_title?: boolean;
        show_logo?: boolean;
        show_clock?: boolean;
    }

    export interface CreatePayload extends PartialPayload {
        name: string;
        meeting_id: Id;
    }

    export interface UpdatePayload extends Identifiable, PartialPayload {
        name?: string;
    }

    export interface DeletePayload extends Identifiable {}

    export interface ControlViewPayload extends Identifiable {
        field: 'scale' | 'scroll';
        direction: ScrollScaleDirection;
        step?: number;
    }

    export interface ProjectPayload {
        ids: Id[];
        meeting_id: Id;
        content_object_id: Fqid;
        options?: object;
        stable?: boolean;
        type?: string;
    }

    export interface NextPayload extends Identifiable {}

    export interface PreviousPayload extends Identifiable {}

    export interface AddToPreviewPayload extends ProjectPayload {}

    export interface ProjectPreviewPayload extends Identifiable {}

    export interface SortPreviewPayload extends Identifiable {
        projection_ids: Id[];
    }
}
