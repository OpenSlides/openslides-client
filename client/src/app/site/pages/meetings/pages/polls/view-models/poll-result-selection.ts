import { BasePollResult } from './base-poll-result';

export class SelectionPollResult extends BasePollResult<SelectionPollResult> {
    [key: number]: string;
    public nota?: string;
    public abstain?: string;
}
