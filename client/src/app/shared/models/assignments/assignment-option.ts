import { Id } from 'app/core/definitions/key-types';
import { BaseOption } from '../poll/base-option';

export class AssignmentOption extends BaseOption<AssignmentOption> {
    public static COLLECTION = 'assignment_option';

    public weight: number;

    public user_id: Id; // user/assignment_option_$<meeting_id>_ids;

    public constructor(input?: any) {
        super(AssignmentOption.COLLECTION, input);
    }
}
