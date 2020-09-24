import { Id } from '../definitions/key-types';

export namespace MotionSubmitterAction {
    export interface CreatePayload {
        user_id: Id;
        motion_id: Id;
    }
    export interface SortPayload {
        motion_id: Id;
        motion_submitter_ids: Id[];
    }
}
