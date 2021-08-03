import { EntitledUsersEntry, PollMethod, PollPercentBase, PollState, PollType } from './poll-constants';

/**
 * The main interface to describe everything related to polls
 * This is a unification of the data received in the projector and ViewPoll; both
 * use this interface, so the poll services can work on this shared view on the data.
 */
export interface PollData {
    pollmethod: PollMethod;
    state: PollState;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    type: PollType;
    entitled_users_at_stop: EntitledUsersEntry[];
    options: OptionData[];
    global_option: OptionData;
    getContentObjectTitle: () => string | null;
}

export interface OptionTitle {
    title: string;
    subtitle?: string;
}

export interface OptionData {
    getOptionTitle: () => OptionTitle;
    yes?: number;
    no?: number;
    abstain?: number;
    weight?: number;
}
