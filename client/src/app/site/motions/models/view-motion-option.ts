import { MotionOption } from 'app/shared/models/motions/motion-option';
import { BaseViewOption } from 'app/site/polls/models/base-view-option';
import { ViewMotionPoll } from './view-motion-poll';
import { ViewMotionVote } from './view-motion-vote';

export class ViewMotionOption extends BaseViewOption<MotionOption, ViewMotionPoll, ViewMotionVote> {
    public static COLLECTION = MotionOption.COLLECTION;
    protected _collection = MotionOption.COLLECTION;

    public get motionOption(): MotionOption {
        return this._model;
    }
}
export interface ViewMotionOption extends MotionOption {}
