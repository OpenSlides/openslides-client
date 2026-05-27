import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export interface ApprovalPollResult {
    yes: string;
    no: string;
    abstain?: string;
    invalid?: number;
}

export class ViewPollConfigApproval extends BasePollConfigViewModel<PollConfigApproval, ApprovalPollResult> {
    public get poll_config_approval(): PollConfigApproval {
        return this._model;
    }

    public static COLLECTION = PollConfigApproval.COLLECTION;
}

interface IPollConfigApprovalRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigApproval extends ViewModelRelations<IPollConfigApprovalRelations>, PollConfigApproval {}
