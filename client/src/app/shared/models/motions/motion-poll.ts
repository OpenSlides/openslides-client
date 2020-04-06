import { Id } from 'app/core/definitions/key-types';
import { CalculablePollKey } from 'app/site/polls/services/poll.service';
import { BasePoll, PercentBase } from '../poll/base-poll';
import { MotionOption } from './motion-option';

export enum MotionPollMethod {
    YN = 'YN',
    YNA = 'YNA'
}

/**
 * Class representing a poll for a motion.
 */
export class MotionPoll extends BasePoll<MotionPoll, MotionOption, MotionPollMethod, PercentBase> {
    public static COLLECTION = 'motion_poll';

    public motion_id: Id;

    public get pollmethodFields(): CalculablePollKey[] {
        const ynField: CalculablePollKey[] = ['yes', 'no'];
        if (this.pollmethod === MotionPollMethod.YN) {
            return ynField;
        } else if (this.pollmethod === MotionPollMethod.YNA) {
            return ynField.concat(['abstain']);
        }
    }

    public constructor(input?: any) {
        super(MotionPoll.COLLECTION, input);
    }
}
