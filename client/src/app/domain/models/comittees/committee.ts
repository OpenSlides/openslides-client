import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export const COMMITTEE_DETAIL_SUBSCRIPTION = `committee_detail`;

export class Committee extends BaseModel<Committee> {
    public static COLLECTION = `committee`;

    public name!: string;
    public description!: string;

    public meeting_ids!: Id[]; // (meeting/committee_id)[];
    public default_meeting_id!: Id; // meeting/default_meeting_for_committee_id;
    public user_ids!: Id[]; // (user/committee_ids)[];
    public forward_to_committee_ids!: Id[]; // (committee/receive_forwardings_from_committee_ids)[];
    public receive_forwardings_from_committee_ids!: Id[]; // (committee/forward_to_committee_ids)[];
    public organization_id!: Id; // organization/committee_ids;
    public organization_tag_ids!: Id[]; // (committee/organization_tag_ids)[];
    public manager_ids!: Id[]; // (user/committe_management_ids)[]

    public constructor(input?: any) {
        super(Committee.COLLECTION, input);
    }
}
