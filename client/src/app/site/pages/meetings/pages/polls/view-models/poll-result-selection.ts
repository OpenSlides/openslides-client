import Big from 'big.js';

import { BasePollResult } from './base-poll-result';
import { ViewPollConfigSelection } from './poll-config-selection';

export class SelectionPollResult extends BasePollResult<ViewPollConfigSelection, SelectionPollResult> {
    [key: number]: string;
    public nota?: string;
    public abstain?: string;

    public constructor(
        public override config: ViewPollConfigSelection,
        input: Partial<SelectionPollResult>
    ) {
        super(config, input);

        if (config.strike_out) {
            const validVotes = this.total_ballots - (this.invalid ?? 0) - +(this.abstain ?? 0);

            const options = config.poll?.options;
            if (options) {
                for (const option of options) {
                    this[option.id.toString()] = Big(validVotes)
                        .sub(Big(this[option.id.toString()] || 0))
                        .toString();
                }
            }
        }
    }
}
