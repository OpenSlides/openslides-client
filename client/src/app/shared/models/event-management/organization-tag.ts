import { Fqid, HtmlColor, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasColor } from '../base/has-color';

export class OrganizationTag extends BaseModel<OrganizationTag> implements HasColor {
    public static readonly COLLECTION = 'organization_tag';

    public id: Id;
    public name: string;
    public color: HtmlColor;

    public organization_id: Id; // organization/organization_tag_ids;
    public committee_ids: Id[]; // (committee/organization_tag_ids)[];
    public meeting_ids: Id[]; // (meeting/organization_tag_ids)[];

    public tagged_ids: Fqid[]; // (has_organization_tag/organization_tag_ids)[];

    public constructor(input?: any) {
        super(OrganizationTag.COLLECTION, input);
    }
}
