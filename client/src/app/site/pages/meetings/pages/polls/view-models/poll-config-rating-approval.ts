import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollConfigOption } from '..';

export class ViewPollConfigRatingApproval extends BaseViewModel<PollConfigRatingApproval> {
    public get poll_config_rating_approval(): PollConfigRatingApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigRatingApproval.COLLECTION;
}

interface IPollConfigRatingApprovalRelations {
    options: ViewPollConfigOption[];
}
export interface ViewPollConfigRatingApproval
    extends ViewModelRelations<IPollConfigRatingApprovalRelations>, PollConfigRatingApproval, HasPoll {}
