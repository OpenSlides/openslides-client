import { AssignmentVote } from 'app/shared/models/assignments/assignment-vote';
import { ViewBaseVote } from 'app/site/polls/models/view-base-vote';

export class ViewAssignmentVote extends ViewBaseVote<AssignmentVote> {
    public static COLLECTION = AssignmentVote.COLLECTION;
    protected _collection = AssignmentVote.COLLECTION;
}

export interface ViewAssignmentVote extends AssignmentVote {}
