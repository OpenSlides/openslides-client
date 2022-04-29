import { HasOrganizationTags } from './has-organization-tags';
import { OrganizationTag } from 'src/app/domain/models/organization-tags/organization-tag';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
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
