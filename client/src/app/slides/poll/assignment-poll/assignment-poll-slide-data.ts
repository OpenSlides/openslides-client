import { EntitledUsersEntry, PollPercentBase, PollState, PollType } from 'app/shared/models/poll/poll-constants';
import { PollMethod } from 'app/shared/models/poll/poll-constants';
import { PollDataOption } from 'app/site/polls/services/poll.service';
import { BasePollSlideData } from 'app/slides/poll/polls/base-poll-slide-data';

export interface AssignmentPollSlideData extends BasePollSlideData {
    assignment: {
        title: string;
    };
    poll: {
        title: string;
        type: PollType;
        pollmethod: PollMethod;
        max_votes_amount: number;
        min_votes_amount: number;
        description: string;
        state: PollState;
        onehundred_percent_base: PollPercentBase;

        global_option: PollDataOption;
        options: {
            user: {
                short_name: string;
            };
            yes?: number;
            no?: number;
            abstain?: number;
        }[];

        entitled_users_at_stop: EntitledUsersEntry[];

        // optional for published polls:
        amount_global_yes?: number;
        amount_global_no?: number;
        amount_global_abstain?: number;
        votesvalid: number;
        votesinvalid: number;
        votescast: number;
    };
}
