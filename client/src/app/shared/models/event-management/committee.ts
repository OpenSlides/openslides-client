import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Committee extends BaseModel<Committee> {
    public static COLLECTION = 'committee';

    public id: Id;
    public name: string;
    public description: string;

    public meeting_ids: Id[]; // (meeting/committee_id)[];
    public default_meting_id: Id; // meeting/default_meeting_for_committee_id;
    public member_ids: Id[]; // (user/committee_as_memeber_ids)[];
    public manager_ids: Id[]; // (user/committee_as_manager_ids)[];
    public forward_to_committee_ids: Id[]; // (committee/receive_forwardings_from_committee_ids)[];
    public receive_forwardings_from_committee_ids: Id[]; // (committee/forward_to_committee_ids)[];
    public organisation_id: Id; // organisation/committee_ids;

    public constructor(input?: any) {
        super(Committee.COLLECTION, input);
    }
}
