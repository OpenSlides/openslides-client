import { OptionDataKey } from './generic-poll';

export enum PollState {
    Created = `created`,
    Started = `started`,
    Finished = `finished`
}

export enum PollVisibility {
    Manually = `manually`,
    Named = `named`,
    Open = `open`,
    Secret = `secret`
}

export enum PollRequiredMajority {
    NoMajority = `no_majority`,
    TwoThirdMajority = `two_third_majority`,
    AbsoluteMajority = `absolute_majority`,
    SimpleMajority = `simple_majority`
}

/**
 * Colors for chart color generation
 * Keys are freely invented and not in sync with html color names
 */
export const pollChartColors = new Map<string, string>([
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

export const pollChartGreys = new Map<string, string>([
    [`grey1`, `#969696`],
    [`grey2`, `#b0b0b0`],
    [`grey3`, `#c2c2c2`],
    [`grey4`, `#e4e4e4`],
    [`grey5`, `#f5f5f5`]
]);

export const YES_KEY: SingleVoteOptionKey = `yes`;
export const NO_KEY: SingleVoteOptionKey = `no`;
export const ABSTAIN_KEY: SingleVoteOptionKey = `abstain`;

export type SingleVoteOptionKey = `yes` | `no` | `abstain`;

export const VOTE_MAJORITY = -1;
export const VOTE_UNDOCUMENTED = -2;
export const LOWEST_VOTE_VALUE = VOTE_UNDOCUMENTED;

/**
 * Interface describes the possible data for the result-table.
 */
export interface PollTableData {
    votingOption: string;
    votingOptionSubtitle?: string;
    votingOptions?: { title: string; subtitle: string }[]; // only if class === `list`
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
    vote?: OptionDataKey;
    amount?: number;
    icon?: string;
    hide?: boolean;
    showPercent?: boolean;
}
