import { Identifiable } from '@app/domain/interfaces';
import { PollConfigRatingApproval } from '@app/domain/models/poll/poll-config-rating-approval';
import { ViewModelRelations } from '@app/site/base/base-view-model';
import Big from 'big.js';

import { HasPoll, RatingApprovalPollResult, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export class ViewPollConfigRatingApproval extends BasePollConfigViewModel<
    PollConfigRatingApproval,
    RatingApprovalPollResult
> {
    public get poll_config_rating_approval(): PollConfigRatingApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingApproval.COLLECTION;

    public get invalidBallots(): number | null {
        return this.parsedResult()?.invalid ?? null;
    }

    public get onehundredPercentBaseNum(): number | null {
        switch (this.onehundred_percent_base) {
            case 'yes_no_abstain':
            case 'yes_no':
                return null;
            case 'valid':
                return this.validBallots;
            case 'cast':
                return this.totalVotes;
            case 'entitled':
                return null;
            case 'entitled_present':
                return null;
        }

        return null;
    }

    public get totalVotes(): number | null {
        return this.parsedResult().total_ballots;
    }

    public getOptionOnehundredPercentBaseNum(option: Identifiable): number | null {
        const result = this.parsedResult();
        switch (this.onehundred_percent_base) {
            case 'yes_no_abstain':
                return Big(result[option.id]?.yes || 0)
                    .plus(result[option.id]?.no || 0)
                    .plus(result[option.id]?.abstain || 0)
                    .toNumber();
            case 'yes_no':
                return Big(result[option.id]?.yes || 0)
                    .plus(result[option.id]?.no || 0)
                    .toNumber();
            case 'valid':
                return this.validBallots;
            case 'cast':
                return this.poll.ballot_ids?.length || 0;
            case 'entitled':
                return null;
            case 'entitled_present':
                return null;
        }

        return null;
    }

    protected getResultFromString(result: string): RatingApprovalPollResult {
        return new RatingApprovalPollResult(this, JSON.parse(result));
    }
}

interface IPollConfigRatingApprovalRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigRatingApproval
    extends ViewModelRelations<IPollConfigRatingApprovalRelations>, PollConfigRatingApproval, HasPoll {}
