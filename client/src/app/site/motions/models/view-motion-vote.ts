import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { ViewBaseVote } from 'app/site/polls/models/view-base-vote';

export class ViewMotionVote extends ViewBaseVote<MotionVote> {
    public static COLLECTION = MotionVote.COLLECTION;
    protected _collection = MotionVote.COLLECTION;
}

export interface ViewMotionVote extends MotionVote {}
