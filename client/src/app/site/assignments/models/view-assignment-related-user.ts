import { AssignmentRelatedUser } from 'app/shared/models/assignments/assignment-related-user';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';

export class ViewAssignmentRelatedUser extends BaseViewModel<AssignmentRelatedUser> {
    public static COLLECTION = AssignmentRelatedUser.COLLECTION;
    protected _collection = AssignmentRelatedUser.COLLECTION;

    public get assignmentRelatedUser(): AssignmentRelatedUser {
        return this._model;
    }

    public getListTitle = () => {
        return this.getTitle();
    };
}

export interface ViewAssignmentRelatedUser extends AssignmentRelatedUser {
    user?: ViewUser;
}
