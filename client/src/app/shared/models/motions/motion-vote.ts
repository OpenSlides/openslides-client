import { BaseVote } from '../poll/base-vote';

export class MotionVote extends BaseVote<MotionVote> {
    public static COLLECTION = 'motion_vote';

    public id: number;

    public constructor(input?: any) {
        super(MotionVote.COLLECTION, input);
    }
}
