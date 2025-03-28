export type VoteValue = 'Y' | 'N' | 'A';

/**
 * A mapping of an id -> VotingData
 */
export type IdentifiedVotingData = Record<number, VotingData>;

export interface VotingData {
    value: Record<number, number> | VoteValue;
}

export const VoteValueVerbose = {
    Y: `Yes`,
    N: `No`,
    A: `Abstain`
};

export const GeneralValueVerbose = {
    votesvalid: `Valid votes`,
    votesinvalid: `Invalid votes`,
    votescast: `Total votes cast`,
    votesno: `Votes No`,
    votesabstain: `Votes abstain`
};
