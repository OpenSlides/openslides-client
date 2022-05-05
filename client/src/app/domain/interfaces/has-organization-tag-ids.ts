import { Id } from '../definitions/key-types';

export interface HasOrganizationTagIds {
    organization_tag_ids: Id[]; // (organization_tag/tagged_ids)[]
}
