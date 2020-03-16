import { BaseOption } from '../poll/base-option';

export class MotionOption extends BaseOption<MotionOption> {
    public static COLLECTION = 'motions/motion-option';

    public constructor(input?: any) {
        super(MotionOption.COLLECTION, input);
    }
}
