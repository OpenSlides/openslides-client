import { Id } from 'app/core/definitions/key-types';
import { BaseVote } from '../poll/base-vote';

export class MotionVote extends BaseVote<MotionVote> {
    public static COLLECTION = 'motion_vote';

    public id: Id;

    public constructor(input?: any) {
        super(MotionVote.COLLECTION, input);
    }
}
