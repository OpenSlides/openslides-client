import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollConfigOption } from '..';

export class ViewPollConfigRatingScore extends BaseViewModel<PollConfigRatingScore> {
    public get poll_config_rating_score(): PollConfigRatingScore {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingScore.COLLECTION;
}

interface IPollConfigRatingScoreRelations {
    options: ViewPollConfigOption[];
}
export interface ViewPollConfigRatingScore
    extends ViewModelRelations<IPollConfigRatingScoreRelations>, PollConfigRatingScore, HasPoll {}
