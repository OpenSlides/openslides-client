import { BasePollResult } from './base-poll-result';

export class RatingApprovalPollResult extends BasePollResult<RatingApprovalPollResult> {
    [key: number]: {
        yes?: string;
        no?: string;
        abstain?: string;
    };

    public abstain?: string;
}
