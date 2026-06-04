import { BasePollResult } from './base-poll-result';
import { ViewPollConfigSelection } from './poll-config-selection';

export class SelectionPollResult extends BasePollResult<ViewPollConfigSelection, SelectionPollResult> {
    [key: number]: string;
    public nota?: string;
    public abstain?: string;
}
