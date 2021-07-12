import { EntitledUsersEntry, PollPercentBase, PollState, PollType } from 'app/shared/models/poll/poll-constants';
import { PollMethod } from 'app/shared/models/poll/poll-constants';
import { PollDataOption } from 'app/site/polls/services/poll.service';
import { BasePollSlideData } from 'app/slides/poll/polls/base-poll-slide-data';
import { ReferencedMotionTitleInformation } from '../../motion-base/base-motion-slide';

export interface MotionPollSlideData extends BasePollSlideData {
    motion: ReferencedMotionTitleInformation;
    poll: {
        title: string;
        type: PollType;
        pollmethod: PollMethod;
        state: PollState;
        onehundred_percent_base: PollPercentBase;

        global_option: PollDataOption;
        options: {
            yes?: number;
            no?: number;
            abstain?: number;
        }[];

        entitled_users_at_stop: EntitledUsersEntry[];

        // optional for published polls:
        votesvalid: number;
        votesinvalid: number;
        votescast: number;
    };
}
