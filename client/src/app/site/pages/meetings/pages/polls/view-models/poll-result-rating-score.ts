import { BasePollResult } from './base-poll-result';

export class RatingScorePollResult extends BasePollResult<RatingScorePollResult> {
    [key: number]: string;
    public abstain?: string;
}
