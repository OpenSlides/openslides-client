import { CalculablePollKey } from 'app/site/polls/services/poll.service';
import { AssignmentOption } from './assignment-option';
import { BasePoll } from '../poll/base-poll';

export enum AssignmentPollMethod {
    YN = 'YN',
    YNA = 'YNA',
    Votes = 'votes'
}

export enum AssignmentPollPercentBase {
    YN = 'YN',
    YNA = 'YNA',
    Votes = 'votes',
    Valid = 'valid',
    Cast = 'cast',
    Disabled = 'disabled'
}

/**
 * Class representing a poll for an assignment.
 */
export class AssignmentPoll extends BasePoll<
    AssignmentPoll,
    AssignmentOption,
    AssignmentPollMethod,
    AssignmentPollPercentBase
> {
    public static COLLECTION = 'assignments/assignment-poll';
    public static defaultGroupsConfig = 'assignment_poll_default_groups';
    public static defaultPollMethodConfig = 'assignment_poll_method';
    public static DECIMAL_FIELDS = [
        'votesvalid',
        'votesinvalid',
        'votescast',
        'amount_global_abstain',
        'amount_global_no'
    ];

    public id: number;
    public assignment_id: number;
    public votes_amount: number;
    public allow_multiple_votes_per_candidate: boolean;
    public global_no: boolean;
    public global_abstain: boolean;
    public amount_global_no: number;
    public amount_global_abstain: number;
    public description: string;

    public get isMethodY(): boolean {
        return this.pollmethod === AssignmentPollMethod.Votes;
    }

    public get isMethodYN(): boolean {
        return this.pollmethod === AssignmentPollMethod.YN;
    }

    public get isMethodYNA(): boolean {
        return this.pollmethod === AssignmentPollMethod.YNA;
    }

    public get pollmethodFields(): CalculablePollKey[] {
        if (this.pollmethod === AssignmentPollMethod.YN) {
            return ['yes', 'no'];
        } else if (this.pollmethod === AssignmentPollMethod.YNA) {
            return ['yes', 'no', 'abstain'];
        } else if (this.pollmethod === AssignmentPollMethod.Votes) {
            return ['yes'];
        }
    }

    public constructor(input?: any) {
        super(AssignmentPoll.COLLECTION, input);
    }

    protected getDecimalFields(): string[] {
        return AssignmentPoll.DECIMAL_FIELDS;
    }
}
