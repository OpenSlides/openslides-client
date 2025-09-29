import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export const COMMITTEE_DETAIL_SUBSCRIPTION = `committee_detail`;

export class Committee extends BaseModel<Committee> {
    public static COLLECTION = `committee`;

    public name!: string;
    public description!: string;
    public external_id!: string;
    public parent_id!: string;
    public child_ids!: Id[];

    public meeting_ids!: Id[]; // (meeting/committee_id)[];
    public default_meeting_id!: Id; // meeting/default_meeting_for_committee_id;
    public user_ids!: Id[]; // (user/committee_ids)[];
    public forward_to_committee_ids!: Id[]; // (committee/receive_forwardings_from_committee_ids)[];
    public receive_forwardings_from_committee_ids!: Id[]; // (committee/forward_to_committee_ids)[];
    public organization_id!: Id; // organization/committee_ids;
    public organization_tag_ids!: Id[]; // (committee/organization_tag_ids)[];
    public manager_ids!: Id[]; // (user/committe_management_ids)[];
    public native_user_ids!: Id[]; // (user/home_committee_id)[];
    public all_parent_ids!: Id[]; // (committee_all_parent_ids)[];
    public all_child_ids!: Id[];

    public constructor(input?: any) {
        super(Committee.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Committee)[] = [
        `id`,
        `name`,
        `description`,
        `external_id`,
        `meeting_ids`,
        `default_meeting_id`,
        `user_ids`,
        `manager_ids`,
        `parent_id`,
        `child_ids`,
        `all_parent_ids`,
        `all_child_ids`,
        `native_user_ids`,
        `forward_to_committee_ids`,
        `receive_forwardings_from_committee_ids`,
        `organization_tag_ids`,
        `organization_id`
    ];
}
