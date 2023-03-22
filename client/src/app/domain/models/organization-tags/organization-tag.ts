import { Fqid, HtmlColor, Id } from '../../definitions/key-types';
import { HasColor } from '../../interfaces/has-color';
import { BaseModel } from '../base/base-model';

export class OrganizationTag extends BaseModel<OrganizationTag> implements HasColor {
    public static readonly COLLECTION = `organization_tag`;

    public name!: string;
    public color!: HtmlColor;

    public organization_id!: Id; // organization/organization_tag_ids;
    public committee_ids!: Id[]; // (committee/organization_tag_ids)[];
    public meeting_ids!: Id[]; // (meeting/organization_tag_ids)[];

    public tagged_ids!: Fqid[]; // (has_organization_tag/organization_tag_ids)[];

    public constructor(input?: any) {
        super(OrganizationTag.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof OrganizationTag | { templateField: string })[] = [
        `id`,
        `name`,
        `color`,
        `tagged_ids`,
        `organization_id`
    ];
}
