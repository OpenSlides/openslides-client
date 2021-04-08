import { AssignmentPhase } from 'app/shared/models/assignments/assignment';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace AssignmentAction {
    export const CREATE = 'assignment.create';
    export const UPDATE = 'assignment.update';
    export const DELETE = 'assignment.delete';

    export interface CreatePayload extends HasMeetingId {
        // Required
        title: string;

        // Optional
        description?: UnsafeHtml;
        open_posts?: number;
        phase?: AssignmentPhase;
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
        phase?: AssignmentPhase;
        default_poll_description?: string;
        number_poll_candidates?: boolean;

        tag_ids?: Id[];
        attachment_ids?: Id[];
    }

    export interface DeletePayload extends Identifiable {}
}
