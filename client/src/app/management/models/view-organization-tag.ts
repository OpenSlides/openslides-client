import { HasOrganizationTagIds } from 'app/shared/models/base/has-organization-tag-ids';
import { OrganizationTag } from 'app/shared/models/event-management/organization-tag';
import { BaseViewModel } from 'app/site/base/base-view-model';

import { ViewOrganization } from './view-organization';

export interface HasOrganizationTags extends HasOrganizationTagIds {
    organization_tags: ViewOrganizationTag[];
}

export class ViewOrganizationTag extends BaseViewModel<OrganizationTag> {
    public static readonly COLLECTION = OrganizationTag.COLLECTION;
    protected _collection = OrganizationTag.COLLECTION;

    public get organizationTag(): OrganizationTag {
        return this._model;
    }
}

interface IOrganizationTagRelations {
    organization: ViewOrganization;
    tagged: (BaseViewModel & HasOrganizationTags)[];
}

export interface ViewOrganizationTag extends OrganizationTag, IOrganizationTagRelations {}
