import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionCommentSectionAction {
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
    export interface SortPayload extends HasMeetingId {
        motion_comment_section_ids: Id[];
    }
}
