import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export enum PollBackendDurationType {
    LONG = `long`,
    FAST = `fast`
}

export const PollBackendDurationChoices = {
    [PollBackendDurationType.FAST]: _(`Short poll`),
    [PollBackendDurationType.LONG]: _(`Long poll`)
};

export interface AssignmentAnalogVoteData {
    options: {
        [key: number]: {
            Y: number;
            N?: number;
            A?: number;
        };
    };
    votesvalid?: number;
    votesinvalid?: number;
    votescast?: number;
    global_yes?: number;
    global_no?: number;
    global_abstain?: number;
}

export interface UserVotingData {
    [user_id: number]: VotingData;
}

export interface VotingData {
    value: { [option_id: number]: number } | VoteValue;
}

export interface UserVote {
    // the voting payload is hard to describe.
    // Can be "VoteValue" or any userID-Number sequence in combination with any VoteValue
    data: Object;
    user_id?: number;
}

export type VoteValue = 'Y' | 'N' | 'A';
export type PollMethodYNA = 'Y' | 'N' | 'A';
export type PollMethodYN = 'Y' | 'N';
export type GlobalVote = 'A' | 'N';

export enum PollClassType {
    Motion = `motion`,
    Assignment = `assignment`
}

export enum PollColor {
    yes = `#4caf50`,
    no = `#cc6c5b`,
    abstain = `#a6a6a6`,
    votesvalid = `#e2e2e2`,
    votesinvalid = `#e2e2e2`,
    votescast = `#e2e2e2`
}

export enum PollState {
    Created = `created`,
    Started = `started`,
    Finished = `finished`,
    Published = `published`
}

export enum PollType {
    Analog = `analog`,
    Named = `named`,
    Pseudoanonymous = `pseudoanonymous`
}

export enum PollMethod {
    Y = `Y`,
    YN = `YN`,
    YNA = `YNA`,
    N = `N`
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
    vote_delegated_to_id?: number;
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
    pseudoanonymous: _(`non-nominal`)
};

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
    min_votes_amount: _(`Minimum amount of votes`)
};

export const AssignmentPollMethodVerbose = {
    Y: _(`Yes per candidate`),
    N: _(`No per candidate`),
    YN: _(`Yes/No per candidate`),
    YNA: _(`Yes/No/Abstain per candidate`)
};

export const AssignmentPollPercentBaseVerbose = {
    Y: _(`Sum of votes including general No/Abstain`),
    YN: _(`Yes/No per candidate`),
    YNA: _(`Yes/No/Abstain per candidate`),
    valid: _(`All valid ballots`),
    cast: _(`All casted ballots`),
    entitled: _(`All entitled users`),
    disabled: _(`Disabled (no percents)`)
};

export const PollMethodVerbose = {
    YN: _(`Yes/No`),
    YNA: _(`Yes/No/Abstain`)
};

export const PollPercentBaseVerbose = {
    YN: `Yes/No`,
    YNA: `Yes/No/Abstain`,
    valid: `All valid ballots`,
    cast: `All casted ballots`,
    entitled: `All entitled users`,
    disabled: `Disabled (no percents)`
};

export const VoteValueVerbose = {
    Y: _(`Yes`),
    N: _(`No`),
    A: _(`Abstain`)
};

export const GeneralValueVerbose = {
    votesvalid: _(`Valid votes`),
    votesinvalid: _(`Invalid votes`),
    votescast: _(`Total votes cast`),
    votesno: `Votes No`,
    votesabstain: `Votes abstain`
};
