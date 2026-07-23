import { BasePollResult } from './base-poll-result';
import { ViewPollConfigRatingScore } from './poll-config-rating-score';

export class RatingScorePollResult extends BasePollResult<ViewPollConfigRatingScore, RatingScorePollResult> {
    [key: number]: string;
    public abstain?: string;
}
