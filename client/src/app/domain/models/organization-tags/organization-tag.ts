import { ModelRequestValueFor } from 'src/app/infrastructure/annotations/model-request';
import { Fqid, HtmlColor, Id } from '../../definitions/key-types';
import { HasColor } from '../../interfaces/has-color';
import { BaseModel } from '../base/base-model';

export const ORGANIZATION_TAG_LIST_SUBSCRIPTION = `organization_tag_list`;

export class OrganizationTag extends BaseModel<OrganizationTag> implements HasColor {
    public static readonly COLLECTION = `organization_tag`;

    @ModelRequestValueFor([ORGANIZATION_TAG_LIST_SUBSCRIPTION])
    public name!: string;
    @ModelRequestValueFor([ORGANIZATION_TAG_LIST_SUBSCRIPTION])
    public color!: HtmlColor;

    @ModelRequestValueFor([ORGANIZATION_TAG_LIST_SUBSCRIPTION])
    public organization_id!: Id; // organization/organization_tag_ids;
    @ModelRequestValueFor([ORGANIZATION_TAG_LIST_SUBSCRIPTION])
    public committee_ids!: Id[]; // (committee/organization_tag_ids)[];
    public meeting_ids!: Id[]; // (meeting/organization_tag_ids)[];

    public tagged_ids!: Fqid[]; // (has_organization_tag/organization_tag_ids)[];

    public constructor(input?: any) {
        super(OrganizationTag.COLLECTION, input);
    }
}
