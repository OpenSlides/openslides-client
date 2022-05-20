import { AssignmentCandidate } from '../../../../../../domain/models/assignments/assignment-candidate';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewUser } from '../../../view-models/view-user';
import { ViewAssignment } from './view-assignment';
export class ViewAssignmentCandidate extends BaseViewModel<AssignmentCandidate> {
    public static COLLECTION = AssignmentCandidate.COLLECTION;
    protected _collection = AssignmentCandidate.COLLECTION;

    public get assignmentCandidate(): AssignmentCandidate {
        return this._model;
    }
}

interface IAssignmentCandidateRelations {
    user: ViewUser;
    assignment: ViewAssignment;
}
export interface ViewAssignmentCandidate extends AssignmentCandidate, IAssignmentCandidateRelations, HasMeeting {}
