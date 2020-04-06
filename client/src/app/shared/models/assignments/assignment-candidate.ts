import { BaseModel } from '../base/base-model';

/**
 * Content of the 'assignment_related_users' property.
 */
export class AssignmentCandidate extends BaseModel<AssignmentCandidate> {
    public static COLLECTION = 'assignment_candidate';

    public id: number;
    public weight: number;

    public assignment_id: number; // assignment/assignment_candidate_ids;
    public user_id: number; // user/assignment_candidate_$<meeting_id>_ids;

    public constructor(input?: any) {
        super(AssignmentCandidate.COLLECTION, input);
    }
}
