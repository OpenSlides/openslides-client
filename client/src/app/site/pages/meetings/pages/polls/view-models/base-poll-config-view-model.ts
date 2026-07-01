import { BaseModel } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { BasePollResult } from './base-poll-result';
import { HasPoll } from './has-polls';

export abstract class BasePollConfigViewModel<
    M extends BaseModel = any,
    R extends BasePollResult = any
> extends BaseViewModel<M> {
    private _parsedResult: R;
    public parsedResult(): R | null {
        if (!this.poll.result) {
            return null;
        }

        if (!this._parsedResult) {
            this._parsedResult = this.getResultFromString(this.poll.result);
        }

        return this._parsedResult || null;
    }

    public get validBallots(): number | null {
        return (this.parsedResult()?.total_ballots || 0) - (this.parsedResult()?.invalid || 0);
    }

    public abstract get invalidBallots(): number | null;
    public abstract get onehundredPercentBaseNum(): number | null;
    public abstract get totalVotes(): number | null;

    protected abstract getResultFromString(result: string): R;
}

export interface BasePollConfigViewModel extends HasPoll {}
