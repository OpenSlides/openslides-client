import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';
import { MotionStateAction } from 'app/core/actions/motion-state-action';

export namespace MotionWorkflowAction {
    export const CREATE = 'motion_workflow.create';
    export const UPDATE = 'motion_workflow.update';
    export const DELETE = 'motion_workflow.delete';
    export const IMPORT = 'motion_workflow.import';

    export interface CreatePayload extends HasMeetingId {
        name: string;
    }

    export interface UpdatePayload extends Identifiable {
        name?: string;
        first_state_id?: Id;
    }

    export interface DeletePayload extends Identifiable {}

    export interface ImportPayload extends HasMeetingId {
        name: string;

        // Optional
        first_state_name?: string;
        states?: MotionStateAction.ImportPayload[];
    }
}
