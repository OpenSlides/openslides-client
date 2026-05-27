import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export interface RatingScorePollResult {
    [key: number]: string;
    abstain?: string;
    invalid?: number;
}

export class ViewPollConfigRatingScore extends BasePollConfigViewModel<PollConfigRatingScore, RatingScorePollResult> {
    public get poll_config_rating_score(): PollConfigRatingScore {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingScore.COLLECTION;
}

interface IPollConfigRatingScoreRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigRatingScore
    extends ViewModelRelations<IPollConfigRatingScoreRelations>, PollConfigRatingScore, HasPoll {}
