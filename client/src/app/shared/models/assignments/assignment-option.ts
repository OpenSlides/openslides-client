import { BaseOption } from '../poll/base-option';

export class AssignmentOption extends BaseOption<AssignmentOption> {
    public static COLLECTION = 'assignment_option';

    public user_id: number;
    public weight: number;

    public constructor(input?: any) {
        super(AssignmentOption.COLLECTION, input);
    }
}
