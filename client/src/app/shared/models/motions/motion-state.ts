import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Specifies if an amendment of this state/recommendation should be merged into the motion
 */
export enum MergeAmendment {
    NO = -1,
    UNDEFINED = 0,
    YES = 1
}

/**
 * Representation of a workflow state
 *
 * @ignore
 */
export class MotionState extends BaseModel<MotionState> {
    public static COLLECTION = 'motion_state';

    public id: Id;
    public name: string;
    public recommendation_label: string;
    public css_class: string;
    public restriction: string[];
    public allow_support: boolean;
    public allow_create_poll: boolean;
    public allow_submitter_edit: boolean;
    public set_number: boolean;
    public show_state_extension_field: boolean;
    public merge_amendment_into_final: MergeAmendment;
    public show_recommendation_extension_field: boolean;

    public next_state_ids: Id[]; // (motion_state/previous_state_ids)[];
    public previous_state_ids: Id[]; // (motion_state/next_state_ids)[];
    public motion_ids: Id[]; // (motion/state_id)[];
    public motion_recommendation_ids: Id[]; // (motion/recommendation_id)[];
    public workflow_id: Id; // motion_workflow/state_ids;
    public first_state_of_workflow_id: Id; // motion_workflow/first_state_id;

    public constructor(input?: any) {
        super(MotionState.COLLECTION, input);
    }
}
