import { BaseModel } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { HasPoll } from './has-polls';

export abstract class BasePollConfigViewModel<M extends BaseModel = any, R = unknown> extends BaseViewModel<M> {
    private _parsedResult: R;
    public parsedResult(): R | null {
        if (!this.poll.result) {
            return null;
        }

        if (!this._parsedResult) {
            this._parsedResult = JSON.parse(this.poll.result);
        }

        return this._parsedResult || null;
    }

    public get validBallots(): number | null {
        // TODO: Change this to use the amount from result if available
        return this.poll.ballot_ids.length - (this.invalidBallots || 0);
    }

    public abstract get invalidBallots(): number | null;
    public abstract get onehundredPercentBaseNum(): number | null;
    public abstract get totalVotes(): number | null;
}

export interface BasePollConfigViewModel extends HasPoll {}
