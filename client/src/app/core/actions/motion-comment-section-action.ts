import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionCommentSectionAction {
    export const CREATE = 'motion_comment_section.create';
    export const UPDATE = 'motion_comment_section.update';
    export const DELETE = 'motion_comment_section.delete';
    export const SORT = 'motion_comment_section.sort';

    interface PartialPayload {
        read_group_ids?: Id[];
        write_group_ids?: Id[];
    }

    export interface CreatePayload extends HasMeetingId, PartialPayload {
        // Required
        name: string;
    }
    export interface UpdatePayload extends Identifiable, PartialPayload {
        name?: string;
    }
    export interface DeletePayload extends Identifiable {}

    export interface SortPayload extends HasMeetingId {
        motion_comment_section_ids: Id[];
    }
}
