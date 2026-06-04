import Big from 'big.js';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';
import { ApprovalPollResult } from './poll-result-approval';

export class ViewPollConfigApproval extends BasePollConfigViewModel<PollConfigApproval, ApprovalPollResult> {
    public get poll_config_approval(): PollConfigApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigApproval.COLLECTION;

    public get invalidBallots(): number | null {
        return this.parsedResult()?.invalid ?? null;
    }

    public get onehundredPercentBaseNum(): number | null {
        switch (this.onehundred_percent_base) {
            case 'yes_no':
                return !this.allow_abstain ? this.totalVotes : null;
            case 'yes_no_abstain':
                return this.totalVotes;
            case 'valid':
                return this.validBallots;
            case 'cast':
                return this.poll.ballot_ids.length;
            case 'entitled':
                return null;
            case 'entitled_present':
                return null;
        }

        return null;
    }

    private _totalVotes: number;
    public get totalVotes(): number | null {
        if (!this._totalVotes) {
            this._totalVotes = Big(this.parsedResult().yes)
                .plus(Big(this.parsedResult().no))
                .plus(Big(this.parsedResult().abstain || 0))
                .toNumber();
        }
        return this._totalVotes;
    }

    protected getResultFromString(result: string): ApprovalPollResult {
        return new ApprovalPollResult(this, JSON.parse(result));
    }
}

interface IPollConfigApprovalRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigApproval extends ViewModelRelations<IPollConfigApprovalRelations>, PollConfigApproval {}
