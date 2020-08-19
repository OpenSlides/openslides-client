import { Organisation } from 'app/shared/models/event-management/organisation';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewCommittee } from './view-committee';
import { ViewResource } from './view-resource';
import { ViewRole } from './view-role';

export class ViewOrganisation extends BaseViewModel<Organisation> {
    public static COLLECTION = Organisation.COLLECTION;
    protected _collection = Organisation.COLLECTION;

    public get organisation(): Organisation {
        return this._model;
    }
}
interface IOrganisationRelations {
    committees: ViewCommittee[];
    roles: ViewRole[];
    superadmin_role: ViewRole;
    resources: ViewResource[];
}
export interface ViewOrganisation extends Organisation, IOrganisationRelations {}
