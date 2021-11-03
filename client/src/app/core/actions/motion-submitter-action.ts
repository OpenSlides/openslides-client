import { Identifiable } from 'app/shared/models/base/identifiable';

import { Id } from '../definitions/key-types';

export namespace MotionSubmitterAction {
    export const CREATE = `motion_submitter.create`;
    export const DELETE = `motion_submitter.delete`;
    export const SORT = `motion_submitter.sort`;

    export interface CreatePayload {
        user_id: Id;
        motion_id: Id;
    }
    export interface DeletePayload {
        id: Id;
    }
    export interface DeletePayload extends Identifiable {}

    export interface SortPayload {
        motion_id: Id;
        motion_submitter_ids: Id[];
    }
}
