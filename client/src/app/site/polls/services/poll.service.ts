import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { ChartData, ChartDate } from 'app/shared/components/charts/charts.component';
import { PollData } from 'app/shared/models/poll/generic-poll';
import {
    ABSTAIN_KEY,
    AssignmentPollMethodVerbose,
    NO_KEY,
    PollColor,
    PollMethod,
    PollPercentBase,
    PollType,
    VOTE_UNDOCUMENTED,
    YES_KEY
} from 'app/shared/models/poll/poll-constants';
import { PollPercentBaseVerbose, PollPropertyVerbose, PollTypeVerbose } from 'app/shared/models/poll/poll-constants';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';

import { OptionData } from '../../../shared/models/poll/generic-poll';

const PERCENT_DECIMAL_PLACES = 3;
/**
 * The possible keys of a poll object that represent numbers.
 * TODO Should be 'key of MotionPoll|AssinmentPoll if type of key is number'
 */
export type CalculablePollKey =
    | 'votesvalid'
    | 'votesinvalid'
    | 'votescast'
    | 'yes'
    | 'no'
    | 'abstain'
    | 'votesno'
    | 'votesabstain';

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
    vote?:
        | 'yes'
        | 'no'
        | 'abstain'
        | 'votesvalid'
        | 'votesinvalid'
        | 'votescast'
        | 'amount_global_yes'
        | 'amount_global_no'
        | 'amount_global_abstain';
    amount?: number;
    icon?: string;
    hide?: boolean;
    showPercent?: boolean;
}

const PollChartBarThickness = 20;

/**
 * Shared service class for polls. Used by child classes {@link MotionPollService}
 * and {@link AssignmentPollService}
 */
@Injectable({
    providedIn: `root`
})
export class PollService {
    public isElectronicVotingEnabled: boolean;

    protected sortByVote = false;

    /**
     * list of poll keys that are numbers and can be part of a quorum calculation
     */
    public pollValues: CalculablePollKey[] = [YES_KEY, NO_KEY, ABSTAIN_KEY, `votesvalid`, `votesinvalid`, `votescast`];

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        protected translate: TranslateService,
        protected pollKeyVerbose: PollKeyVerbosePipe,
        protected parsePollNumber: ParsePollNumberPipe
    ) {
        organizationSettingsService
            .get(`enable_electronic_voting`)
            .subscribe(isEnabled => (this.isElectronicVotingEnabled = isEnabled));
    }

    public generateTableData(poll: PollData): PollTableData[] {
        // console.log("generateTableData"); // PROBLEM EXISTS ALREADY HERE
        // console.log(poll.options);
        const tableData: PollTableData[] = poll.options
            .sort((a, b) => {
                if (this.sortByVote) {
                    let compareValue;
                    if (poll.pollmethod === PollMethod.N) {
                        // least no on top:
                        compareValue = a.no - b.no;
                    } else {
                        // most yes on top
                        compareValue = b.yes - a.yes;
                    }

                    // Equal votes, sort by weight to have equal votes correctly sorted.
                    if (compareValue === 0 && a.weight && b.weight) {
                        // least weight on top
                        return a.weight - b.weight;
                    } else {
                        return compareValue;
                    }
                }

                // PollData does not have weight, we need to rely on the order of things.
                if (a.weight && b.weight) {
                    // least weight on top
                    return a.weight - b.weight;
                } else {
                    return 0;
                }
            })
            .map(option => {
                const title = option.getOptionTitle();
                const pollTableEntry: PollTableData = {
                    class: `user`,
                    value: this.getVoteTableKeys(poll).map(
                        key =>
                            ({
                                vote: key.vote,
                                amount: option[key.vote],
                                icon: key.icon,
                                hide: key.hide,
                                showPercent: key.showPercent
                            } as VotingResult)
                    ),
                    votingOption: title.title
                };
                if (title.subtitle) {
                    pollTableEntry.votingOptionSubtitle = title.subtitle;
                }

                return pollTableEntry;
            });
        tableData.push(...this.formatVotingResultToTableData(this.getGlobalVoteKeys(poll), poll));
        tableData.push(...this.formatVotingResultToTableData(this.getSumTableKeys(poll), poll));

        return tableData;
    }

    public getChartLabels(poll: PollData): string[] {
        const fields = this.getPollDataFields(poll);
        return poll.options.map(option => {
            const votingResults = fields.map(field => {
                const voteValue = option[field];
                const votingKey = this.translate.instant(this.pollKeyVerbose.transform(field));
                const resultValue = this.parsePollNumber.transform(voteValue);
                const resultInPercent = this.getVoteValueInPercent(voteValue, { poll, row: option });
                let resultLabel = `${votingKey}: ${resultValue}`;

                // 0 is a valid number in this case
                if (resultInPercent !== null) {
                    resultLabel += ` (${resultInPercent})`;
                }
                return resultLabel;
            });
            const optionName = option.getOptionTitle().title;
            return `${optionName} · ${votingResults.join(` · `)}`;
        });
    }

    private getGlobalVoteKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: `amount_global_yes`,
                showPercent: this.showPercentOfValidOrCast(poll),
                amount: poll.global_option?.yes,
                hide:
                    poll.global_option?.yes === VOTE_UNDOCUMENTED ||
                    !poll.global_option?.yes ||
                    poll.pollmethod === PollMethod.N
            },
            {
                vote: `amount_global_no`,
                showPercent: this.showPercentOfValidOrCast(poll),
                amount: poll.global_option?.no,
                hide: poll.global_option?.no === VOTE_UNDOCUMENTED || !poll.global_option?.no
            },
            {
                vote: `amount_global_abstain`,
                showPercent: this.showPercentOfValidOrCast(poll),
                amount: poll.global_option?.abstain,
                hide: poll.global_option?.abstain === VOTE_UNDOCUMENTED || !poll.global_option?.abstain
            }
        ];
    }

    private formatVotingResultToTableData(resultList: VotingResult[], poll: PollData): PollTableData[] {
        return resultList
            .filter(key => !key.hide)
            .map(key => ({
                votingOption: key.vote,
                class: `sums`,
                value: [
                    {
                        amount: key.amount ?? poll[key.vote],
                        hide: key.hide,
                        showPercent: key.showPercent
                    } as VotingResult
                ]
            }));
    }

    /**
     * returns the total number of votes depending on the selected percent base
     */
    protected getPercentBase(poll: PollData, row?: OptionData): number {
        const base: PollPercentBase = poll.onehundred_percent_base as PollPercentBase;
        let totalByBase: number;
        const option = row ?? poll.options[0]; // Assuming that its a motion poll and the first option contains every vote.
        switch (base) {
            case PollPercentBase.YN:
                totalByBase = this.sumOptionsYN(option);
                break;
            case PollPercentBase.YNA:
                totalByBase = this.sumOptionsYNA(option);
                break;
            case PollPercentBase.Y:
                totalByBase = this.sumOptionsYNA(option);
                break;
            case PollPercentBase.Valid:
                totalByBase = poll.votesvalid;
                break;
            case PollPercentBase.Entitled:
                totalByBase = poll.entitled_users_at_stop?.length || 0;
                break;
            case PollPercentBase.Cast:
                totalByBase = poll.votescast;
                break;
            default:
                break;
        }
        return totalByBase;
    }

    private sumOptionsYN(option: OptionData): number {
        return (option?.yes ?? 0) + (option?.no ?? 0);
    }

    private sumOptionsYNA(option: OptionData): number {
        return this.sumOptionsYN(option) + (option?.abstain ?? 0);
    }

    public getVoteValueInPercent(
        value: number,
        { poll, row }: { poll: PollData; row?: OptionData | PollTableData }
    ): string | null {
        const option: OptionData | undefined = isPollTableData(row) ? this.transformToOptionData(row) : row;
        const totalByBase = this.getPercentBase(poll, option);
        if (totalByBase && totalByBase > 0) {
            const percentNumber = (value / totalByBase) * 100;
            if (percentNumber >= 0) {
                const result = percentNumber % 1 === 0 ? percentNumber : percentNumber.toFixed(PERCENT_DECIMAL_PLACES);
                return `${result} %`;
            }
        }
        return null;
    }

    public getVerboseNameForValue(key: string, value: string): string {
        switch (key) {
            case `onehundred_percent_base`:
                return PollPercentBaseVerbose[value];
            case `pollmethod`:
                return AssignmentPollMethodVerbose[value];
            case `type`:
                return PollTypeVerbose[value];
        }
    }

    public getVerboseNameForKey(key: string): string {
        return PollPropertyVerbose[key];
    }

    public getVoteTableKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: YES_KEY,
                icon: `thumb_up`,
                showPercent: true
            },
            {
                vote: NO_KEY,
                icon: `thumb_down`,
                showPercent: true
            },
            {
                vote: ABSTAIN_KEY,
                icon: `trip_origin`,
                showPercent: this.showAbstainPercent(poll)
            }
        ];
    }

    private showAbstainPercent(poll: PollData): boolean {
        return (
            poll.onehundred_percent_base === PollPercentBase.YNA ||
            poll.onehundred_percent_base === PollPercentBase.Valid ||
            poll.onehundred_percent_base === PollPercentBase.Cast
        );
    }

    public showPercentOfValidOrCast(poll: PollData): boolean {
        return (
            poll.onehundred_percent_base === PollPercentBase.Valid ||
            poll.onehundred_percent_base === PollPercentBase.Cast ||
            poll.onehundred_percent_base === PollPercentBase.Entitled
        );
    }

    public getSumTableKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: `votesvalid`,
                icon: `done`,
                hide: poll.votesvalid === VOTE_UNDOCUMENTED,
                showPercent: this.showPercentOfValidOrCast(poll)
            },
            {
                vote: `votesinvalid`,
                icon: `not_interested`,
                hide: poll.votesinvalid === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            },
            {
                vote: `votescast`,
                icon: `label`,
                hide: poll.votescast === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            }
        ];
    }

    public generateChartData(poll: PollData): ChartData {
        const fields = this.getPollDataFields(poll);

        const data: ChartData = fields
            .map(
                key =>
                    ({
                        data: this.getResultFromPoll(poll, key), // 0: option, 1: global_option
                        label: key.toUpperCase(),
                        backgroundColor: PollColor[key],
                        hoverBackgroundColor: PollColor[key],
                        barThickness: PollChartBarThickness,
                        maxBarThickness: PollChartBarThickness
                    } as ChartDate)
            )
            .filter(chartDate => !!chartDate.data[0] || !!chartDate.data[1]);

        return data;
    }

    /**
     * Extracts yes-no-abstain such as valid, invalids and totals from Poll and PollData-Objects
     */
    protected getResultFromPoll(poll: PollData, key: CalculablePollKey): number[] {
        return [...poll.options, poll.global_option].map(option => (option ? option[key] : undefined));
    }

    protected getPollDataFields(_poll: PollData): CalculablePollKey[] {
        throw new Error(`Method not implemented`);
    }

    public isVoteDocumented(vote: number): boolean {
        return vote !== null && vote !== undefined && vote !== VOTE_UNDOCUMENTED;
    }

    private transformToOptionData(data: PollTableData): OptionData {
        const yes = this.getVotingResultFromTableData(data, YES_KEY);
        const no = this.getVotingResultFromTableData(data, NO_KEY);
        const abstain = this.getVotingResultFromTableData(data, ABSTAIN_KEY);
        return {
            getOptionTitle: () => ({ title: data.votingOption, subtitle: data.votingOptionSubtitle }),
            yes: yes?.amount,
            no: no?.amount,
            abstain: abstain?.amount
        };
    }

    private getVotingResultFromTableData(data: PollTableData, key: `yes` | `no` | `abstain`): VotingResult {
        if (data.votingOption === key) {
            return data.value[0];
        } else {
            return data.value.find(vote => vote.vote === key);
        }
    }
}
