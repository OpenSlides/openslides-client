import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export interface RatingApprovalPollResult {
    [key: number]: {
        yes?: string;
        no?: string;
        abstain?: string;
    };
    abstain?: string;
    invalid?: number;
}

export class ViewPollConfigRatingApproval extends BasePollConfigViewModel<
    PollConfigRatingApproval,
    RatingApprovalPollResult
> {
    public get poll_config_rating_approval(): PollConfigRatingApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingApproval.COLLECTION;
}

interface IPollConfigRatingApprovalRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigRatingApproval
    extends ViewModelRelations<IPollConfigRatingApprovalRelations>, PollConfigRatingApproval, HasPoll {}
