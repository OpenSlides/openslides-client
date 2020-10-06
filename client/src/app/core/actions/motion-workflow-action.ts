import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionWorkflowAction {
    export interface CreatePayload extends HasMeetingId {
        name: string;
    }

    export interface UpdatePayload extends Identifiable {
        name?: string;
        first_state_id?: Id;
    }
}
