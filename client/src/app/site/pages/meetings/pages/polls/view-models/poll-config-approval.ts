import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollOption } from '..';

export class ViewPollConfigApproval extends BaseViewModel<PollConfigApproval> {
    public get poll_config_approval(): PollConfigApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigApproval.COLLECTION;
}

interface IPollConfigApprovalRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigApproval
    extends ViewModelRelations<IPollConfigApprovalRelations>, PollConfigApproval, HasPoll {}
