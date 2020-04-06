import { AssignmentOption } from 'app/shared/models/assignments/assignment-option';
import { ViewBaseOption } from 'app/site/polls/models/view-base-option';
import { ViewUser } from 'app/site/users/models/view-user';

export class ViewAssignmentOption extends ViewBaseOption<AssignmentOption> {
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
