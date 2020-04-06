import { Organisation } from 'app/shared/models/event-management/organisation';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewCommittee } from './view-committee';
import { ViewResource } from './view-resource';
import { ViewRole } from './view-role';

export interface OrganisationTitleInformation {
    name: string;
}

export class ViewOrganisation extends BaseViewModel<Organisation> implements OrganisationTitleInformation {
    public static COLLECTION = Organisation.COLLECTION;
    protected _collection = Organisation.COLLECTION;

    public get organisation(): Organisation {
        return this._model;
    }
}
interface IOrganisationRelations {
    committees: ViewCommittee[];
    roles: ViewRole[];
    resources: ViewResource[];
}
export interface ViewOrganisation extends Organisation, IOrganisationRelations {}
