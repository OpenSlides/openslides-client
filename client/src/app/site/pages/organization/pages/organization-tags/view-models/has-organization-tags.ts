import { HasOrganizationTagIds } from '../../../../../../domain/interfaces/has-organization-tag-ids';
import { ViewOrganizationTag } from './view-organization-tag';

export interface HasOrganizationTags extends HasOrganizationTagIds {
    organization_tags: ViewOrganizationTag[];
}
