import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion workflow. Has the nested property 'states'
 * @ignore
 */
export class Workflow extends BaseModel<Workflow> {
    public static COLLECTION = 'motions/workflow';

    public id: number;
    public name: string;
    public states_id: number[];
    public first_state_id: number;

    public constructor(input?: any) {
        super(Workflow.COLLECTION, input);
    }
}
