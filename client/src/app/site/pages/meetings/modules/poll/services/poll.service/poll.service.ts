import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OptionData, PollData } from 'src/app/domain/models/poll/generic-poll';
import { OptionDataKey } from 'src/app/domain/models/poll/generic-poll';
import {
    ABSTAIN_KEY,
    CalculablePollKey,
    isPollTableData,
    NO_KEY,
    PollMethod,
    PollPercentBase,
    PollPercentBaseVerbose,
    PollPercentBaseVerboseKey,
    PollPropertyVerbose,
    PollPropertyVerboseKey,
    PollTableData,
    PollType,
    PollTypeVerbose,
    PollTypeVerboseKey,
    PollValues,
    RequiredMajorityBase,
    VOTE_MAJORITY,
    VOTE_UNDOCUMENTED,
    VotingResult,
    YES_KEY
} from 'src/app/domain/models/poll/poll-constants';
import { compareNumber } from 'src/app/infrastructure/utils';
import { ChartData, ChartDate } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ThemeService } from 'src/app/site/services/theme.service';

import { isSortedList } from '../../../../pages/polls/view-models/sorted-list';
import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { PollServiceModule } from '../poll-service.module';

const PollChartBarThickness = 20;
const PERCENT_DECIMAL_PLACES = 3;

@Injectable({ providedIn: PollServiceModule })
export abstract class PollService {
    protected sortByVote = false;
    protected enableMaxVotesPerOption = false;

    public get isElectronicVotingEnabled(): boolean {
        return this._isElectronicVotingEnabled;
    }

    private _isElectronicVotingEnabled = false;

    private organizationSettingsService = inject(OrganizationSettingsService);
    protected translate = inject(TranslateService);
    protected themeService = inject(ThemeService);
    protected activeMeeting = inject(ActiveMeetingService);

    public constructor() {
        this.organizationSettingsService
            .get(`enable_electronic_voting`)
            .subscribe(is => (this._isElectronicVotingEnabled = is));
    }

    public generateTableData(poll: PollData): PollTableData[] {
        const tableData: PollTableData[] = poll.options
            .sort((a, b) => {
                if (this.sortByVote) {
                    let compareValue;
                    if (poll.pollmethod === PollMethod.N) {
                        // least no on top:
                        compareValue = compareNumber(b.no, a.no);
                    } else {
                        // most yes on top
                        compareValue = compareNumber(a.yes, b.yes);
                    }

                    // Equal votes, sort by weight to have equal votes correctly sorted.
                    if (compareValue === 0 && a.weight && b.weight) {
                        // least weight on top
                        return compareNumber(b.weight, a.weight);
                    } else {
                        return compareValue;
                    }
                }

                // PollData does not have weight, we need to rely on the order of things.
                if (a.weight && b.weight) {
                    // least weight on top
                    return compareNumber(b.weight, a.weight);
                } else {
                    return 0;
                }
            })
            .map(option => {
                const title = option.getOptionTitle();
                const pollTableEntry: PollTableData = {
                    class: isSortedList(option.content_object) ? `list` : `user`,
                    value: this.getVoteTableKeys(poll).map(
                        key =>
                            ({
                                vote: key.vote,
                                amount: option[key.vote as OptionDataKey] ?? 0,
                                icon: key.icon,
                                hide: key.hide,
                                showPercent: key.showPercent
                            }) as VotingResult
                    ),
                    votingOption: title.title
                };
                if (title.subtitle) {
                    pollTableEntry.votingOptionSubtitle = title.subtitle;
                }
                if (isSortedList(option.content_object)) {
                    pollTableEntry.votingOptions = option.content_object.entries
                        .sort((a, b) => a.weight - b.weight)
                        .map(entry => ({ title: entry.getTitle(), subtitle: entry.getSubtitle() }));
                }

                return pollTableEntry;
            });
        tableData.push(...this.formatVotingResultToTableData(this.getGlobalVoteKeys(poll), poll));
        tableData.push(...this.formatVotingResultToTableData(this.getSumTableKeys(poll), poll));

        return tableData;
    }

    public getChartLabels(poll: PollData, excludeYNALabels = false): string[] {
        const fields = this.getPollDataFields(poll);
        return poll.options.map(option => {
            const votingResults = fields.map(field => {
                const voteValue = option[field] as number;
                const votingKey = this.translate.instant(this.pollKeyVerbose(field));
                const resultValue = this.parseNumber(voteValue);
                const resultInPercent = this.getVoteValueInPercent(voteValue, { poll, row: option });
                let resultLabel = `${resultValue}`;
                if (!excludeYNALabels) {
                    resultLabel = `${votingKey}: ${resultLabel}`;
                }

                // 0 is a valid number in this case
                if (resultInPercent) {
                    resultLabel += ` (${resultInPercent})`;
                }
                return resultLabel;
            });
            const optionName = option.getOptionTitle().title;
            return `${optionName} · ${votingResults.join(` · `)}`;
        });
    }

    public pollKeyVerbose(value: string): string {
        return PollValues[value] || value;
    }

    public parseNumber(value?: number, maximumFractionDigits = 6): string {
        let lang = this.translate.getCurrentLang();
        if (this.activeMeeting.meeting) {
            lang = this.activeMeeting.meeting.language;
        }
        const formatter = new Intl.NumberFormat(lang, {
            style: `decimal`,
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits
        });

        switch (value) {
            case VOTE_MAJORITY:
                return this.translate.instant(`majority`);
            case undefined:
            case null:
                return formatter.format(0);
            case VOTE_UNDOCUMENTED:
                return this.translate.instant(`undocumented`);
            default:
                return formatter.format(value);
        }
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
            .map(
                key =>
                    ({
                        votingOption: key.vote,
                        class: `sums`,
                        value: [
                            {
                                amount: key.amount ?? poll[key.vote! as keyof PollData],
                                hide: key.hide,
                                showPercent: key.showPercent
                            } as VotingResult
                        ]
                    }) as PollTableData
            );
    }

    /**
     * returns the total number of votes depending on the selected percent base
     */
    protected getPercentBase(poll: PollData, row?: OptionData): number {
        const base: PollPercentBase = poll.onehundred_percent_base as PollPercentBase;
        let totalByBase = 0;
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
                totalByBase = poll.votesvalid > 0 ? poll.votesvalid : 0;
                break;
            case PollPercentBase.Entitled:
                totalByBase = poll.entitled_users_at_stop?.length || 0;
                break;
            case PollPercentBase.EntitledPresent:
                totalByBase = poll.entitled_users_at_stop?.filter(x => x.present).length || 0;
                break;
            case PollPercentBase.Cast:
                totalByBase = poll.votescast > 0 ? poll.votescast : 0;
                break;
            default:
                break;
        }
        return totalByBase;
    }

    private sumOptionsYN(option: OptionData): number {
        const yes = option?.yes ?? 0;
        const no = option?.no ?? 0;
        return (yes >= 0 ? yes : 0) + (no >= 0 ? no : 0);
    }

    private sumOptionsYNA(option: OptionData): number {
        const abstain = option?.abstain ?? 0;
        return this.sumOptionsYN(option) + (abstain >= 0 ? abstain : 0);
    }

    public getVoteValueInPercent(
        value: number,
        { poll, row }: { poll: PollData; row?: OptionData | PollTableData }
    ): string {
        const option: OptionData | undefined = isPollTableData(row) ? this.transformToOptionData(row) : row;
        const totalByBase = this.getPercentBase(poll, option);
        if (totalByBase && totalByBase > 0) {
            const percentNumber = (value / totalByBase) * 100;
            if (percentNumber >= 0) {
                return `${this.parseNumber(percentNumber, PERCENT_DECIMAL_PLACES)} %`;
            }
        }
        return ``;
    }

    public getRequiredMajorityBase(poll: PollData, row?: OptionData | PollTableData): number | null {
        const option: OptionData | undefined = isPollTableData(row) ? this.transformToOptionData(row) : row;
        const totalByBase = this.getPercentBase(poll, option);
        if (!totalByBase) {
            return null;
        }
        switch (poll.required_majority) {
            case RequiredMajorityBase.absolute_majority:
                return totalByBase / 2;
            case RequiredMajorityBase.two_third_majority:
                return (totalByBase * 2) / 3;
            default:
                return null;
        }
    }

    public isRequiredMajority(value: number, poll: PollData, row?: OptionData | PollTableData): boolean {
        const requiredMajorityBase = this.getRequiredMajorityBase(poll, row);
        if (requiredMajorityBase === null) {
            return false;
        }
        return value > requiredMajorityBase;
    }

    /**
     * @deprecated Please rewrite this function
     *
     * @param key
     * @param value
     * @returns
     */
    public getVerboseNameForValue(key: string, value: PollPercentBaseVerboseKey | PollTypeVerboseKey): string {
        switch (key) {
            case `onehundred_percent_base`:
                return PollPercentBaseVerbose[value as PollPercentBaseVerboseKey];
            case `type`:
                return PollTypeVerbose[value as PollTypeVerboseKey];
        }
        return ``;
    }

    public getVerboseNameForKey(key: PollPropertyVerboseKey): string {
        return PollPropertyVerbose[key];
    }

    public getVoteTableKeys(poll: PollData): VotingResult[] {
        const keys: VotingResult[] = [
            {
                vote: YES_KEY,
                icon: `check_circle`,
                showPercent: true
            },
            {
                vote: NO_KEY,
                icon: `cancel`,
                showPercent: true
            }
        ];

        if (poll.pollmethod !== PollMethod.YN) {
            keys.push({
                vote: ABSTAIN_KEY,
                icon: `circle`,
                showPercent: this.showAbstainPercent(poll)
            });
        }

        return keys;
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
            poll.onehundred_percent_base === PollPercentBase.Entitled ||
            poll.onehundred_percent_base === PollPercentBase.EntitledPresent
        );
    }

    public getSumTableKeys(poll: PollData): VotingResult[] {
        return [
            {
                vote: `votesvalid`,
                hide: poll.votesvalid === VOTE_UNDOCUMENTED,
                showPercent: this.showPercentOfValidOrCast(poll)
            },
            {
                vote: `votesinvalid`,
                hide: poll.votesinvalid === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            },
            {
                vote: `votescast`,
                hide: poll.votescast === VOTE_UNDOCUMENTED || poll.type !== PollType.Analog,
                showPercent: poll.onehundred_percent_base === PollPercentBase.Cast
            }
        ];
    }

    public generateChartData(poll: PollData): ChartData {
        let fields = this.getPollDataFields(poll);
        if (poll?.onehundred_percent_base === PollPercentBase.YN || poll?.pollmethod === PollMethod.YN) {
            fields = fields.filter(key => key === YES_KEY || key === NO_KEY);
        }

        const data: ChartData = fields
            .map(
                key =>
                    ({
                        data: this.getResultFromPoll(poll, key), // 0: option, 1: global_option
                        label: key.toUpperCase(),
                        backgroundColor: this.themeService.getPollColor(key),
                        hoverBackgroundColor: this.themeService.getPollColor(key),
                        barThickness: PollChartBarThickness,
                        maxBarThickness: PollChartBarThickness
                    }) as ChartDate
            )
            .filter(chartDate => !!chartDate.data[0] || !!chartDate.data[1]);

        return data;
    }

    /**
     * Extracts yes-no-abstain such as valid, invalids and totals from Poll and PollData-Objects
     */
    protected getResultFromPoll(poll: PollData, key: CalculablePollKey): (number | undefined)[] {
        return (poll ? [...poll.options, poll.global_option] : []).map(option => (option ? option[key] : undefined));
    }

    protected getPollDataFields(_poll: PollData): CalculablePollKey[] {
        throw new Error(`Method not implemented`);
    }

    public isVoteDocumented(vote: number): boolean {
        return vote !== null && vote !== undefined && vote !== VOTE_UNDOCUMENTED;
    }

    public isMaxVotesPerOptionEnabled(): boolean {
        return this.enableMaxVotesPerOption;
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

    private getVotingResultFromTableData(data: PollTableData, key: `yes` | `no` | `abstain`): VotingResult | undefined {
        if (data.votingOption === key) {
            return data.value[0];
        } else {
            return data.value.find(vote => vote.vote === key);
        }
    }
}
