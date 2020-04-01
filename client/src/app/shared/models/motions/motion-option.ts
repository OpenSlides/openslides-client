import { BaseOption } from '../poll/base-option';

export class MotionOption extends BaseOption<MotionOption> {
    public static COLLECTION = 'motion_option';

    public constructor(input?: any) {
        super(MotionOption.COLLECTION, input);
    }
}
