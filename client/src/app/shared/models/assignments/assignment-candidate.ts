import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Content of the 'assignment_related_users' property.
 */
export class AssignmentCandidate extends BaseModel<AssignmentCandidate> {
    public static COLLECTION = 'assignment_candidate';

    public id: Id;
    public weight: number;

    public assignment_id: Id; // assignment/candidate_ids;
    public user_id: Id; // user/assignment_candidate_$<meeting_id>_ids;

    public constructor(input?: any) {
        super(AssignmentCandidate.COLLECTION, input);
    }
}
