import { Organisation } from 'app/shared/models/event-management/organisation';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewCommittee } from './view-committee';
import { ViewOrganisationTag } from './view-organisation-tag';
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
    resources: ViewResource[];
    organisation_tags: ViewOrganisationTag;
}
export interface ViewOrganisation extends Organisation, IOrganisationRelations {}
