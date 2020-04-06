import { Role } from 'app/shared/models/event-management/role';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewOrganisation } from './view-organisation';

export interface RoleTitleInformation {
    name: string;
}

export class ViewRole extends BaseViewModel<Role> implements RoleTitleInformation {
    public static COLLECTION = Role.COLLECTION;
    protected _collection = Role.COLLECTION;

    public get role(): Role {
        return this._model;
    }
}
interface IRoleRelations {
    organisation: ViewOrganisation;
    users: ViewUser[];
}
export interface ViewRole extends Role, IRoleRelations {}
