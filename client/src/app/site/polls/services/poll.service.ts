import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { ChartData, ChartDate } from 'app/shared/components/charts/charts.component';
import { Poll } from 'app/shared/models/poll/poll';
import {
    AssignmentPollMethodVerbose,
    MajorityMethod,
    PollClassType,
    PollColor,
    PollMethod,
    PollPercentBase,
    PollState,
    PollType,
    VOTE_UNDOCUMENTED
} from 'app/shared/models/poll/poll-constants';
import {
    MajorityMethodVerbose,
    PollPercentBaseVerbose,
    PollPropertyVerbose,
    PollTypeVerbose
} from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
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
 * Interface representing possible majority calculation methods. The implementing
 * calc function should return an integer number that must be reached for the
 * option to successfully fulfill the quorum, or null if disabled
 */
export interface CalculableMajorityMethod {
    value: string;
    display_name: string;
    calc: (base: number) => number | null;
}

/**
 * Function to round up the passed value of a poll.
 *
 * @param value The calculated value of 100%-base.
 * @param addOne Flag, if the result should be increased by 1.
 *
 * @returns The necessary value to get the majority.
 */
export const calcMajority = (value: number, addOne: boolean = false) => {
    return Math.ceil(value) + (addOne ? 1 : 0);
};

/**
 * List of available majority methods, used in motion and assignment polls
 */
export const PollMajorityMethod: CalculableMajorityMethod[] = [
    {
        value: 'simple_majority',
        display_name: 'Simple majority',
        calc: base => calcMajority(base / 2, true)
    },
    {
        value: 'two-thirds_majority',
        display_name: 'Two-thirds majority',
        calc: base => calcMajority((base * 2) / 3)
    },
    {
        value: 'three-quarters_majority',
        display_name: 'Three-quarters majority',
        calc: base => calcMajority((base * 3) / 4)
    },
    {
        value: 'disabled',
        display_name: 'Disabled',
        calc: a => null
    }
];

export interface BasePollData<PM, PB> {
    pollmethod: PM;
    state: PollState;
    onehundred_percent_base: PB;
    votesvalid: number;
    votesinvalid: number;
    votescast: number;
}

export interface PollData extends BasePollData<string, string> {
    type: string;
    amount_global_yes?: number;
    amount_global_no?: number;
    amount_global_abstain?: number;
    options: PollDataOption[];
    global_option: PollDataOption;
}

export interface PollDataOption {
    content_object?: {
        short_name?: string;
    };
    yes?: number;
    no?: number;
    abstain?: number;
    weight?: number;
}

/**
 * Interface describes the possible data for the result-table.
 */
export interface PollTableData {
    votingOption?: string;
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
export abstract class PollService {
    /**
     * The default percentage base
     */
    public defaultPercentBase: PollPercentBase;

    /**
     * The default majority method
     */
    public abstract defaultMajorityMethod: MajorityMethod;

    /**
     * Per default entitled to vote
     */
    public abstract defaultGroupIds: number[];

    /**
     * The default poll type
     */
    public abstract defaultPollType: PollType;

    /**
     * The majority method currently in use
     */
    public majorityMethod: CalculableMajorityMethod;

    public isElectronicVotingEnabled: boolean;

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

    /**
     * return the total number of votes depending on the selected percent base
     */
    public abstract getPercentBase(poll: PollData): number;

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

    /**
     * Assigns the default poll data to the object. To be extended in subclasses
     * @param poll the poll/object to fill
     */
    public getDefaultPollData(): Partial<Poll> {
        return {
            onehundred_percent_base: this.defaultPercentBase,
            majority_method: this.defaultMajorityMethod,
            entitled_group_ids: this.defaultGroupIds,
            type: this.isElectronicVotingEnabled ? this.defaultPollType : PollType.Analog
        };
    }

    public getVerboseNameForValue(key: string, value: string): string {
        switch (key) {
            case 'majority_method':
                return MajorityMethodVerbose[value];
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

    public getVoteTableKeys(poll: ViewPoll): VotingResult[] {
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

    private showAbstainPercent(poll: ViewPoll): boolean {
        return (
            poll.onehundred_percent_base === PollPercentBase.YNA ||
            poll.onehundred_percent_base === PollPercentBase.Valid ||
            poll.onehundred_percent_base === PollPercentBase.Cast
        );
    }

    public showPercentOfValidOrCast(poll: ViewPoll): boolean {
        return (
            poll.onehundred_percent_base === PollPercentBase.Valid ||
            poll.onehundred_percent_base === PollPercentBase.Cast
        );
    }

    public getSumTableKeys(poll: ViewPoll): VotingResult[] {
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

    public generateChartData(poll: PollData | ViewPoll): ChartData {
        const fields = this.getPollDataFields(poll);

        const data: ChartData = fields
            .filter(key => {
                return this.getPollDataFieldsByPercentBase(poll).includes(key);
            })
            .map(key => {
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

    protected getPollDataFields(poll: PollData | ViewPoll): CalculablePollKey[] {
        const isAssignment: boolean = (poll as ViewPoll).pollClassType === PollClassType.Assignment;
        return isAssignment ? this.getPollDataFieldsByMethod(poll) : this.getPollDataFieldsByPercentBase(poll);
    }

    /**
     * Extracts yes-no-abstain such as valid, invalids and totals from Poll and PollData-Objects
     */
    protected abstract getResultFromPoll(poll: PollData, key: CalculablePollKey): number[];

    private getPollDataFieldsByMethod(poll: PollData | ViewPoll): CalculablePollKey[] {
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

    private getPollDataFieldsByPercentBase(poll: PollData | ViewPoll): CalculablePollKey[] {
        switch (poll.onehundred_percent_base) {
            case PollPercentBase.YN: {
                return ['yes', 'no'];
            }
            case PollPercentBase.Cast: {
                return ['yes', 'no', 'abstain', 'votesinvalid'];
            }
            default: {
                return ['yes', 'no', 'abstain'];
            }
        }
    }

    public isVoteDocumented(vote: number): boolean {
        return vote !== null && vote !== undefined && vote !== VOTE_UNDOCUMENTED;
    }
}
