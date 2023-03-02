import { Observable } from 'rxjs';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { EntitledUsersEntry, PollClassType, PollMethod, PollPercentBase, PollState, PollType } from './poll-constants';

/**
 * The main interface to describe everything related to polls
 * This is a unification of the data received in the projector and ViewPoll; both
 * use this interface, so the poll services can work on this shared view on the data.
 */
export interface PollData {
    pollClassType?: PollClassType;
    pollmethod: PollMethod;
    state: PollState;
    onehundred_percent_base: PollPercentBase;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
    type: PollType;
    entitled_users_at_stop: EntitledUsersEntry[];
    options: OptionData[];
    options_as_observable: Observable<OptionData[]>;
    global_option: OptionData;
    content_object?: BaseViewModel<any>;
    getContentObjectTitle: () => string | null;
}

export type PollDataKey = keyof PollData;

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
    votesvalid?: number;
    votesinvalid?: number;
    votescast?: number;
    amount_global_yes?: number;
    amount_global_no?: number;
    amount_global_abstain?: number;
    content_object?: BaseViewModel<any>;
    entries_amount?: number;
}

export type OptionDataKey = keyof OptionData;
