import {
    EntitledUsersEntry,
    MajorityMethod,
    PollPercentBase,
    PollState,
    PollType
} from 'app/shared/models/poll/poll-constants';
import { PollDataOption } from 'app/site/polls/services/poll.service';

export interface BasePollSlideData {
    poll: {
        title: string;
        type: PollType;
        state: PollState;
        onehundred_percent_base: PollPercentBase;
        majority_method: MajorityMethod;
        pollmethod: string;

        global_option: PollDataOption;
        options: {
            yes?: number;
            no?: number;
            abstain?: number;
        }[];

        entitled_users_at_stop: EntitledUsersEntry[];

        votesvalid: number;
        votesinvalid: number;
        votescast: number;
    };
}
