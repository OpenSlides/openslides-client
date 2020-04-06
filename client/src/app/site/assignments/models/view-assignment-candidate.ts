import { AssignmentCandidate } from 'app/shared/models/assignments/assignment-candidate';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
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
export interface ViewAssignmentCandidate extends AssignmentCandidate, IAssignmentCandidateRelations {}
