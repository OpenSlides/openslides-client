import { BasePollResult } from './base-poll-result';

export class ApprovalPollResult extends BasePollResult<ApprovalPollResult> {
    public yes: string;
    public no: string;
    public abstain?: string;
}
