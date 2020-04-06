import { BaseModel } from '../base/base-model';

export class Committee extends BaseModel<Committee> {
    public static COLLECTION = 'committee';

    public id: number;
    public name: string;
    public description: string;

    public meeting_ids: number[]; // (meeting/committee_id)[];
    public default_meting_id: number; // meeting/default_meeting_for_committee_id;
    public member_ids: number[]; // (user/committee_as_memeber_ids)[];
    public manager_ids: number[]; // (user/committee_as_manager_ids)[];
    public forward_to_committee_ids: number[]; // (committee/receive_forwardings_from_committee_ids)[];
    public receive_forwardings_from_committee_ids: number[]; // (committee/forward_to_committee_ids)[];
    public organisation_id: number; // organisation/committee_ids;

    public constructor(input?: any) {
        super(Committee.COLLECTION, input);
    }
}
