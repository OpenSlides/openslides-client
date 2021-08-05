import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { ChartData, ChartDate } from 'app/shared/components/charts/charts.component';
import { PollData } from 'app/shared/models/poll/generic-poll';
import {
    AssignmentPollMethodVerbose,
    PollColor,
    PollMethod,
    PollPercentBase,
    PollType,
    VOTE_UNDOCUMENTED
} from 'app/shared/models/poll/poll-constants';
import { PollPercentBaseVerbose, PollPropertyVerbose, PollTypeVerbose } from 'app/shared/models/poll/poll-constants';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';

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
    Y: 'Yes',
    N: 'No',
    A: 'Abstain'
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
    providedIn: 'root'
})
export class PollService {
    public isElectronicVotingEnabled: boolean;

    protected sortByVote = false;

    /**
     * list of poll keys that are numbers and can be part of a quorum calculation
     */
    public pollValues: CalculablePollKey[] = ['yes', 'no', 'abstain', 'votesvalid', 'votesinvalid', 'votescast'];

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        protected translate: TranslateService,
        protected pollKeyVerbose: PollKeyVerbosePipe,
        protected parsePollNumber: ParsePollNumberPipe
    ) {
        organizationSettingsService
            .get('enable_electronic_voting')
            .subscribe(isEnabled => (this.isElectronicVotingEnabled = isEnabled));
    }

    public generateTableData(poll: PollData): PollTableData[] {
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
                    class: 'user',
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
        const fields = this.getPollDataFieldsByMethod(poll);
        return poll.options.map(option => {
            const votingResults = fields.map(field => {
                const voteValue = option[field];
                const votingKey = this.translate.instant(this.pollKeyVerbose.transform(field));
                const resultValue = this.parsePollNumber.transform(voteValue);
                const resultInPercent = this.getVoteValueInPercent(voteValue, poll);
                let resultLabel = `${votingKey}: ${resultValue}`;

                // 0 is a valid number in this case
                if (resultInPercent !== null) {
                    resultLabel += ` (${resultInPercent})`;
                }
                return resultLabel;
            });
            const optionName = option.getOptionTitle();
            return `${optionName} · ${votingResults.join(' · ')}`;
        });
    }

    private getGlobalVoteKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: 'amount_global_yes',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide:
                    poll.global_option?.yes === VOTE_UNDOCUMENTED ||
                    !poll.global_option?.yes ||
                    poll.pollmethod === PollMethod.N
            },
            {
                vote: 'amount_global_no',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide: poll.global_option?.no === VOTE_UNDOCUMENTED || !poll.global_option?.no
            },
            {
                vote: 'amount_global_abstain',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide: poll.global_option?.abstain === VOTE_UNDOCUMENTED || !poll.global_option?.abstain
            }
        ];
    }

    private formatVotingResultToTableData(resultList: VotingResult[], poll: PollData): PollTableData[] {
        return resultList
            .filter(key => {
                return !key.hide;
            })
            .map(key => ({
                votingOption: key.vote,
                class: 'sums',
                value: [
                    {
                        amount: poll[key.vote],
                        hide: key.hide,
                        showPercent: key.showPercent
                    } as VotingResult
                ]
            }));
    }

    /**
     * return the total number of votes depending on the selected percent base
     */
    public getPercentBase(poll: PollData): number {
        const base: PollPercentBase = poll.onehundred_percent_base as PollPercentBase;
        let totalByBase: number;
        switch (base) {
            case PollPercentBase.YN:
                totalByBase = this.sumOptionsYN(poll);
                break;
            case PollPercentBase.YNA:
                totalByBase = this.sumOptionsYNA(poll);
                break;
            case PollPercentBase.Y:
                totalByBase = this.sumOptionsYNA(poll);
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

    private sumOptionsYN(poll: PollData): number {
        return poll.options.reduce((o, n) => {
            o += n.yes > 0 ? n.yes : 0;
            o += n.no > 0 ? n.no : 0;
            return o;
        }, 0);
    }

    private sumOptionsYNA(poll: PollData): number {
        return poll.options.reduce((o, n) => {
            o += n.abstain > 0 ? n.abstain : 0;
            return o;
        }, this.sumOptionsYN(poll));
    }

    public getVoteValueInPercent(value: number, poll: PollData): string | null {
        const totalByBase = this.getPercentBase(poll);
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
            case 'onehundred_percent_base':
                return PollPercentBaseVerbose[value];
            case 'pollmethod':
                return AssignmentPollMethodVerbose[value];
            case 'type':
                return PollTypeVerbose[value];
        }
    }

    public getVerboseNameForKey(key: string): string {
        return PollPropertyVerbose[key];
    }

    public getVoteTableKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: 'yes',
                icon: 'thumb_up',
                showPercent: true
            },
            {
                vote: 'no',
                icon: 'thumb_down',
                showPercent: true
            },
            {
                vote: 'abstain',
                icon: 'trip_origin',
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
                vote: 'votesvalid',
                icon: 'done',
                hide: poll.votesvalid === VOTE_UNDOCUMENTED,
                showPercent: this.showPercentOfValidOrCast(poll)
            },
            {
                vote: 'votesinvalid',
                icon: 'not_interested',
                hide: poll.votesinvalid === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            },
            {
                vote: 'votescast',
                icon: 'label',
                hide: poll.votescast === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            }
        ];
    }

    public generateChartData(poll: PollData): ChartData {
        const fields = this.getPollDataFieldsByMethod(poll);

        const data: ChartData = fields.map(key => {
            return {
                data: this.getResultFromPoll(poll, key),
                label: key.toUpperCase(),
                backgroundColor: PollColor[key],
                hoverBackgroundColor: PollColor[key],
                barThickness: PollChartBarThickness,
                maxBarThickness: PollChartBarThickness
            } as ChartDate;
        });

        return data;
    }

    /**
     * Extracts yes-no-abstain such as valid, invalids and totals from Poll and PollData-Objects
     */
    protected getResultFromPoll(poll: PollData, key: CalculablePollKey): number[] {
        return [...poll.options, poll.global_option].map(option => option[key]);
    }

    protected getPollDataFieldsByMethod(poll: PollData): CalculablePollKey[] {
        switch (poll.pollmethod) {
            case PollMethod.YNA: {
                return ['yes', 'no', 'abstain'];
            }
            case PollMethod.YN: {
                return ['yes', 'no'];
            }
            case PollMethod.N: {
                return ['no'];
            }
            default: {
                return ['yes'];
            }
        }
    }

    public isVoteDocumented(vote: number): boolean {
        return vote !== null && vote !== undefined && vote !== VOTE_UNDOCUMENTED;
    }
}
