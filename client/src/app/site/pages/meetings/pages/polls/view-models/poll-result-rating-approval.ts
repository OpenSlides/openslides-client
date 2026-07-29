import { BasePollResult } from './base-poll-result';
import { ViewPollConfigRatingApproval } from './poll-config-rating-approval';

export class RatingApprovalPollResult extends BasePollResult<ViewPollConfigRatingApproval, RatingApprovalPollResult> {
    [key: number]: {
        yes?: string;
        no?: string;
        abstain?: string;
    };

    public abstain?: string;
}
