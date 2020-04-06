import { AssignmentOption } from 'app/shared/models/assignments/assignment-option';
import { BaseViewOption } from 'app/site/polls/models/base-view-option';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewAssignmentPoll } from './view-assignment-poll';
import { ViewAssignmentVote } from './view-assignment-vote';

export class ViewAssignmentOption extends BaseViewOption<AssignmentOption, ViewAssignmentPoll, ViewAssignmentVote> {
    public static COLLECTION = AssignmentOption.COLLECTION;
    protected _collection = AssignmentOption.COLLECTION;

    public get assignmentOption(): AssignmentOption {
        return this._model;
    }
}
interface IAssignmentOptionRelations {
    user: ViewUser;
}
export interface ViewAssignmentOption extends AssignmentOption, IAssignmentOptionRelations {}
