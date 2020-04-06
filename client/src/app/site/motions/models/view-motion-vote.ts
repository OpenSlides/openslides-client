import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { BaseViewVote } from 'app/site/polls/models/base-view-vote';
import { ViewMotionOption } from './view-motion-option';

export class ViewMotionVote extends BaseViewVote<MotionVote, ViewMotionOption> {
    public static COLLECTION = MotionVote.COLLECTION;
    protected _collection = MotionVote.COLLECTION;

    public get motionVote(): MotionVote {
        return this._model;
    }
}

export interface ViewMotionVote extends MotionVote {}
