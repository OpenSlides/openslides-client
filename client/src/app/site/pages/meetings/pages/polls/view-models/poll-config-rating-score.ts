import Big from 'big.js';
import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, RatingScorePollResult, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export class ViewPollConfigRatingScore extends BasePollConfigViewModel<PollConfigRatingScore, RatingScorePollResult> {
    public get poll_config_rating_score(): PollConfigRatingScore {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingScore.COLLECTION;

    public get invalidBallots(): number | null {
        return this.parsedResult()?.invalid ?? null;
    }

    public get onehundredPercentBaseNum(): number | null {
        switch (this.onehundred_percent_base) {
            case 'yes_no':
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

    public get totalVotes(): number | null {
        let total = Big(0);
        const result = this.parsedResult();
        if (!result) {
            return null;
        }

        for (const key of Object.keys(result)) {
            if (key === `invalid`) {
                continue;
            }

            total = total.plus(result[key]);
        }

        return total.toNumber();
    }

    protected getResultFromString(result: string): RatingScorePollResult {
        return new RatingScorePollResult(JSON.parse(result));
    }
}

interface IPollConfigRatingScoreRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigRatingScore
    extends ViewModelRelations<IPollConfigRatingScoreRelations>, PollConfigRatingScore, HasPoll {}
