import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

/**
 * Specifies if an amendment of this state/recommendation should be merged into the motion
 */
export enum MergeAmendment {
    NO = `do_not_merge`,
    UNDEFINED = `undefined`,
    YES = `do_merge`
}

/**
 * Restrictions are usually processed in the motion workflow
 */
export enum Restriction {
    motionsCanManage = `motion.can_manage`,
    motionsCanSeeInternal = `motion.can_see_internal`,
    motionsCanManageMetadata = `motion.can_manage_metadata`,
    motionsIsSubmitter = `is_submitter`
}

/**
 * Representation of a workflow state
 *
 * @ignore
 */
export class MotionState extends BaseModel<MotionState> {
    public static COLLECTION = `motion_state`;

    public name!: string;
    public recommendation_label!: string;
    public css_class!: string;
    public restrictions!: Restriction[];
    public allow_support!: boolean;
    public allow_create_poll!: boolean;
    public allow_submitter_edit!: boolean;
    public allow_motion_forwarding!: boolean;
    public set_created_timestamp!: boolean;
    public set_number!: boolean;
    public show_state_extension_field!: boolean;
    public merge_amendment_into_final!: MergeAmendment;
    public show_recommendation_extension_field!: boolean;
    public weight!: number;

    public next_state_ids!: Id[]; // (motion_state/previous_state_ids)[];
    public previous_state_ids!: Id[]; // (motion_state/next_state_ids)[];
    public motion_ids!: Id[]; // (motion/state_id)[];
    public motion_recommendation_ids!: Id[]; // (motion/recommendation_id)[];
    public workflow_id!: Id; // motion_workflow/state_ids;
    public first_state_of_workflow_id!: Id; // motion_workflow/first_state_id;
    public submitter_withdraw_state_id!: Id;
    public submitter_withdraw_back_ids!: Id[];

    public constructor(input?: any) {
        super(MotionState.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionState)[] = [
        `id`,
        `name`,
        `weight`,
        `recommendation_label`,
        `css_class`,
        `restrictions`,
        `allow_support`,
        `allow_create_poll`,
        `allow_submitter_edit`,
        `set_number`,
        `show_state_extension_field`,
        `show_recommendation_extension_field`,
        `merge_amendment_into_final`,
        `allow_motion_forwarding`,
        `set_created_timestamp`,
        `submitter_withdraw_state_id`,
        `submitter_withdraw_back_ids`,
        `next_state_ids`,
        `previous_state_ids`,
        `motion_ids`,
        `motion_recommendation_ids`,
        `workflow_id`,
        `first_state_of_workflow_id`,
        `meeting_id`
    ];
}
export interface MotionState extends HasMeetingId {}
