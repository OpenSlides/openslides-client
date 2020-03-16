import { MotionOption } from 'app/shared/models/motions/motion-option';
import { ViewBaseOption } from 'app/site/polls/models/view-base-option';

export class ViewMotionOption extends ViewBaseOption<MotionOption> {
    public static COLLECTION = MotionOption.COLLECTION;
    protected _collection = MotionOption.COLLECTION;
}
export interface ViewMotionOption extends MotionOption {}
