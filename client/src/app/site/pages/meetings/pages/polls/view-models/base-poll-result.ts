import { BasePollConfigViewModel } from './base-poll-config-view-model';

export abstract class BasePollResult<C extends BasePollConfigViewModel = any, T = any> {
    public total_ballots: number;
    public invalid?: number;

    public constructor(
        public config: C,
        input: Partial<T>
    ) {
        Object.assign(this, input);
    }
}
