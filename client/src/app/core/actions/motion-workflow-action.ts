import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MotionWorkflowAction {
    export const CREATE = 'motion_workflow.create';
    export const UPDATE = 'motion_workflow.update';
    export const DELETE = 'motion_workflow.delete';

    export interface CreatePayload extends HasMeetingId {
        name: string;
    }

    export interface UpdatePayload extends Identifiable {
        name?: string;
        first_state_id?: Id;
    }
}
