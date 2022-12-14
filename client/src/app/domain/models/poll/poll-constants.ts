import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { OptionDataKey, PollDataKey } from './generic-poll';

export const YES_KEY = `yes`;
export const NO_KEY = `no`;
export const ABSTAIN_KEY = `abstain`;
export const INVALID_VOTES_KEY = `votesinvalid`;

export enum PollBackendDurationType {
    LONG = `long`,
    FAST = `fast`
}

export const PollBackendDurationChoices = {
    [PollBackendDurationType.FAST]: _(`short running`),
    [PollBackendDurationType.LONG]: _(`long running`)
};

export type PollMethodYNA = 'Y' | 'N' | 'A';
export type PollMethodYN = 'Y' | 'N';
export type GlobalVote = 'Y' | 'A' | 'N';

export enum PollClassType {
    Motion = `motion`,
    Assignment = `assignment`,
    Topic = `topic`
}

export enum PollColor {
    votesvalid = `#e2e2e2`,
    votesinvalid = `#e2e2e2`,
    votescast = `#e2e2e2`
}

/**
 * Colors for chart color generation
 * Keys are freely invented and not in sync with html color names
 */
export const pollChartColors: Map<string, string> = new Map([
    [`green1`, `#5fbfa2`],
    [`red1`, `#f94144`],
    [`blue1`, `#317796`],
    [`orange1`, `#d4520c`],
    [`blue2`, `#509191`],
    [`orange2`, `#f9ac4e`],
    [`blue3`, `#6788a2`],
    [`orange3`, `#f8793a`],
    [`blue4`, `#6bbadb`],
    [`yellow1`, `#eca809`]
]);

export const pollChartGreys: Map<string, string> = new Map([
    [`grey1`, `#969696`],
    [`grey2`, `#b0b0b0`],
    [`grey3`, `#c2c2c2`],
    [`grey4`, `#e4e4e4`],
    [`grey5`, `#f5f5f5`]
]);

export enum PollState {
    Created = `created`,
    Started = `started`,
    Finished = `finished`,
    Published = `published`
}

export enum PollType {
    Analog = `analog`,
    Named = `named`,
    Pseudoanonymous = `pseudoanonymous`,
    Cryptographic = `cryptographic`
}

export enum PollMethod {
    Y = `Y`,
    YN = `YN`,
    YNA = `YNA`,
    N = `N`
}

export enum FormPollMethod {
    Y = `Y`,
    YN = `YN`,
    YNA = `YNA`,
    N = `N`,
    LIST_YNA = `yna`
}

export enum PollPercentBase {
    Y = `Y`,
    YN = `YN`,
    YNA = `YNA`,
    Valid = `valid`,
    Cast = `cast`,
    Entitled = `entitled`,
    Disabled = `disabled`
}

export interface EntitledUsersEntry {
    user_id: number;
    voted: boolean;
    vote_delegated_to_user_id?: number;
}

export const VOTE_MAJORITY = -1;
export const VOTE_UNDOCUMENTED = -2;
export const LOWEST_VOTE_VALUE = VOTE_UNDOCUMENTED;

export const PollClassTypeVerbose = {
    motion: `Vote`,
    assignment: `Ballot`
};

export const PollStateVerbose = {
    created: `created`,
    started: `started`,
    finished: `finished (unpublished)`,
    published: `published`
};

export const PollStateChangeActionVerbose = {
    created: _(`Reset`),
    started: _(`Start voting`),
    finished: _(`Stop voting`),
    published: _(`Publish`)
};

export const PollTypeVerbose = {
    analog: _(`analog`),
    named: _(`nominal`),
    pseudoanonymous: _(`non-nominal`),
    cryptographic: _(`cryptographic`)
};

export type PollTypeVerboseKey = keyof typeof PollTypeVerbose;

export const PollPropertyVerbose = {
    onehundred_percent_base: _(`100% base`),
    type: _(`Voting type`),
    pollmethod: _(`Voting method`),
    state: _(`State`),
    groups: _(`Entitled to vote`),
    votes_amount: _(`Amount of votes`),
    global_yes: _(`General approval`),
    global_no: _(`General rejection`),
    global_abstain: _(`General abstain`),
    max_votes_amount: _(`Maximum amount of votes`),
    min_votes_amount: _(`Minimum amount of votes`),
    max_votes_per_option: _(`Maximum amount of votes per option`)
};

export type PollPropertyVerboseKey = keyof typeof PollPropertyVerbose;

export const PollMethodVerbose = {
    Y: ``,
    N: ``,
    YN: _(`Yes/No`),
    YNA: _(`Yes/No/Abstain`)
};

export const PollPercentBaseVerbose = {
    Y: ``,
    YN: _(`Yes/No`),
    YNA: _(`Yes/No/Abstain`),
    valid: _(`All valid ballots`),
    cast: _(`All casted ballots`),
    entitled: _(`All entitled users`),
    disabled: _(`Disabled (no percents)`)
};

export type PollPercentBaseVerboseKey = keyof typeof PollPercentBaseVerbose;

export type GlobalOptionKey = `global_yes` | `global_no` | `global_abstain`;
export type VoteKey = 'votesvalid' | 'votesinvalid' | 'votescast';

/**
 * The possible keys of a poll object that represent numbers.
 * TODO Should be 'key of MotionPoll|AssinmentPoll if type of key is number'
 */
export type CalculablePollKey = VoteKey | 'yes' | 'no' | 'abstain';

/**
 * TODO: may be obsolete if the server switches to lower case only
 * (lower case variants are already in CalculablePollKey)
 */
export type PollVoteValue = 'Yes' | 'No' | 'Abstain' | 'Votes';

export const VoteValuesVerbose = {
    Y: `Yes`,
    N: `No`,
    A: `Abstain`
};

/**
 * Interface describes the possible data for the result-table.
 */
export interface PollTableData {
    votingOption: string;
    votingOptionSubtitle?: string;
    votingOptions?: { title: string; subtitle: string }[]; //only if class === `list`
    class?: string;
    value: VotingResult[];
}

export function isPollTableData(data: any): data is PollTableData {
    if (!data) {
        return false;
    }
    return !!data.votingOption && !!data.value;
}

export interface VotingResult {
    vote?: OptionDataKey | PollDataKey;
    amount?: number;
    icon?: string;
    hide?: boolean;
    showPercent?: boolean;
}
