import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionBlockAction {
    export interface CreatePayload extends HasMeetingId {
        title: string;
        internal: boolean;

        // Non-model fields for customizing the agenda item creation, optional
        agenda_create: boolean;
        agenda_type: number;
        agenda_parent_id: number;
        agenda_comment: string;
        agenda_duration: number;
        agenda_weight: number;
    }
    export interface UpdatePayload extends Identifiable {
        title?: string;
        internal?: boolean;
        motion_ids?: Id[];
    }
}
