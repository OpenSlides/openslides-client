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
 * Part of the 'states'-array in motion/workflow
 * @ignore
 */
export class State extends BaseModel<State> {
    public static COLLECTION = 'motions/state';

    public id: number;
    public name: string;
    public recommendation_label: string;
    public css_class: string;
    public restriction: string[];
    public allow_support: boolean;
    public allow_create_poll: boolean;
    public allow_submitter_edit: boolean;
    public dont_set_identifier: boolean;
    public show_state_extension_field: boolean;
    public merge_amendment_into_final: MergeAmendment;
    public show_recommendation_extension_field: boolean;
    public next_states_id: number[];
    public workflow_id: number;

    /**
     * Needs to be completely optional because Workflow has (yet) the optional parameter 'states'
     * @param input If given, it will be deserialized
     */
    public constructor(input?: any) {
        super(State.COLLECTION, input);
    }
}
