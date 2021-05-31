import { HtmlColor, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasColor } from '../base/has-color';

export class OrganisationTag extends BaseModel<OrganisationTag> implements HasColor {
    public static readonly COLLECTION = 'organisation_tag';

    public id: Id;
    public name: string;
    public color: HtmlColor;

    public organisation_id: Id; // organisation/organisation_tag_ids;
    public committee_ids: Id[]; // (committee/organisation_tag_ids)[];
    public meeting_ids: Id[]; // (meeting/organisation_tag_ids)[];

    public constructor(input?: any) {
        super(OrganisationTag.COLLECTION, input);
    }
}
