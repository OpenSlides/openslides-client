import { OrganizationTag } from '@app/domain/models/organization-tags/organization-tag';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { ViewOrganization } from '@app/site/pages/organization/view-models/view-organization';

import { HasOrganizationTags } from './has-organization-tags';
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
