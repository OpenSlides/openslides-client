import { AssignmentVote } from 'app/shared/models/assignments/assignment-vote';
import { BaseViewVote } from 'app/site/polls/models/base-view-vote';
import { ViewAssignmentOption } from './view-assignment-option';

export class ViewAssignmentVote extends BaseViewVote<AssignmentVote, ViewAssignmentOption> {
    public static COLLECTION = AssignmentVote.COLLECTION;
    protected _collection = AssignmentVote.COLLECTION;

    public get assignmentVote(): AssignmentVote {
        return this._model;
    }
}

export interface ViewAssignmentVote extends AssignmentVote {}
