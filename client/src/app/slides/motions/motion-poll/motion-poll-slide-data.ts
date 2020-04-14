import { MotionPollMethod } from 'app/shared/models/motions/motion-poll';
import { MajorityMethod, PercentBase, PollState, PollType } from 'app/shared/models/poll/base-poll';
import { BasePollSlideData } from 'app/slides/polls/base-poll-slide-data';
import { ReferencedMotionTitleInformation } from '../base/base-motion-slide';

export interface MotionPollSlideData extends BasePollSlideData {
    motion: ReferencedMotionTitleInformation;
    poll: {
        title: string;
        type: PollType;
        pollmethod: MotionPollMethod;
        state: PollState;
        onehundred_percent_base: PercentBase;
        majority_method: MajorityMethod;

        options: {
            yes?: number;
            no?: number;
            abstain?: number;
        }[];

        // optional for published polls:
        votesvalid: number;
        votesinvalid: number;
        votescast: number;
    };
}
