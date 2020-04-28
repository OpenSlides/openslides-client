import { Group } from 'app/shared/models/users/group';
import { BaseViewModel } from '../../base/base-view-model';

export interface GroupTitleInformation {
    name: string;
}

export class ViewGroup extends BaseViewModel<Group> implements GroupTitleInformation {
    public static COLLECTION = Group.COLLECTION;

    public get group(): Group {
        return this._model;
    }

    public hasPermission(perm: string): boolean {
        return this.permissions.includes(perm);
    }
}
export interface ViewGroup extends Group {}
