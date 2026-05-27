import { BaseModel } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { HasPoll } from './has-polls';

export abstract class BasePollConfigViewModel<M extends BaseModel = any, R = unknown> extends BaseViewModel<M> {
    public parsedResult(): R | null {
        if (!this.poll.result) {
            return null;
        }

        return JSON.parse(this.poll.result) || null;
    }
}

export interface BasePollConfigViewModel extends HasPoll {}
