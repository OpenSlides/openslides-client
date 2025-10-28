import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { AssignmentCandidate } from '../../../../../../domain/models/assignments/assignment-candidate';
import { BaseHasMeetingUserViewModel } from '../../../base/base-has-meeting-user-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewAssignment } from './view-assignment';

export class ViewAssignmentCandidate extends BaseHasMeetingUserViewModel<AssignmentCandidate> {
    public static COLLECTION = AssignmentCandidate.COLLECTION;
    protected _collection = AssignmentCandidate.COLLECTION;

    public get assignmentCandidate(): AssignmentCandidate {
        return this._model;
    }
}

interface IAssignmentCandidateRelations {
    assignment: ViewAssignment;
}
export interface ViewAssignmentCandidate
    extends AssignmentCandidate,
        ViewModelRelations<IAssignmentCandidateRelations>,
        HasMeeting {}
