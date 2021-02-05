import { Organisation } from 'app/shared/models/event-management/organisation';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewCommittee } from './view-committee';
import { ViewResource } from './view-resource';

export class ViewOrganisation extends BaseViewModel<Organisation> {
    public static COLLECTION = Organisation.COLLECTION;
    protected _collection = Organisation.COLLECTION;

    public get organisation(): Organisation {
        return this._model;
    }
}
interface IOrganisationRelations {
    committees: ViewCommittee[];
    roles: ViewUser[];
    superadmin_role: ViewUser;
    resources: ViewResource[];
}
export interface ViewOrganisation extends Organisation, IOrganisationRelations {}
