import { BaseVote } from '../poll/base-vote';

export class AssignmentVote extends BaseVote<AssignmentVote> {
    public static COLLECTION = 'assignment_vote';

    public id: number;

    public constructor(input?: any) {
        super(AssignmentVote.COLLECTION, input);
    }
}
