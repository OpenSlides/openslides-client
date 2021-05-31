import { OrganisationTag } from 'app/shared/models/event-management/organisation-tag';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewCommittee } from './view-committee';
import { ViewMeeting } from './view-meeting';
import { ViewOrganisation } from './view-organisation';

export class ViewOrganisationTag extends BaseViewModel<OrganisationTag> {
    public static readonly COLLECTION = OrganisationTag.COLLECTION;
    protected _collection = OrganisationTag.COLLECTION;

    public get organisationTag(): OrganisationTag {
        return this._model;
    }
}

interface IOrganisationTagRelations {
    organisation: ViewOrganisation;
    committees: ViewCommittee[];
    meetings: ViewMeeting[];
}

export interface ViewOrganisationTag extends OrganisationTag, IOrganisationTagRelations {}
