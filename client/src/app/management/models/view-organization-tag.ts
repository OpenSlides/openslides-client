import { OrganizationTag } from 'app/shared/models/event-management/organization-tag';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewCommittee } from './view-committee';
import { ViewMeeting } from './view-meeting';
import { ViewOrganization } from './view-organization';

export class ViewOrganizationTag extends BaseViewModel<OrganizationTag> {
    public static readonly COLLECTION = OrganizationTag.COLLECTION;
    protected _collection = OrganizationTag.COLLECTION;

    public get organizationTag(): OrganizationTag {
        return this._model;
    }
}

interface IOrganizationTagRelations {
    organization: ViewOrganization;
    committees: ViewCommittee[];
    meetings: ViewMeeting[];
}

export interface ViewOrganizationTag extends OrganizationTag, IOrganizationTagRelations {}
