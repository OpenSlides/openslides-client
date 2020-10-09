import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace AssignmentCandidateAction {
    export const ADD = 'assignment_candidate.create';
    export const REMOVE = 'assignment_candidate.delete';
    export const SORT = 'assignment_candidate.sort';

    interface AssignmentIdentifiable {
        assignment_id: Id;
    }

    export interface DeletePayload extends Identifiable {}
    export interface CreatePayload extends AssignmentIdentifiable {
        user_id: Id;
    }
    export interface SortPayload extends AssignmentIdentifiable {
        candidate_ids: Id[];
    }
}
