import { BasePollResult } from './base-poll-result';
import { ViewPollConfigApproval } from './poll-config-approval';

export class ApprovalPollResult extends BasePollResult<ViewPollConfigApproval, ApprovalPollResult> {
    public yes: string;
    public no: string;
    public abstain?: string;
}
