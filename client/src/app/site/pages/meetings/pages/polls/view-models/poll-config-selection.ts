import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export interface SelectionPollResult {
    [key: number]: string;
    abstain?: string;
    invalid?: number;
}

export class ViewPollConfigSelection extends BasePollConfigViewModel<PollConfigSelection, SelectionPollResult> {
    public get poll_config_selection(): PollConfigSelection {
        return this._model;
    }

    public static COLLECTION = PollConfigSelection.COLLECTION;
}

interface IPollConfigSelectionRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigSelection
    extends ViewModelRelations<IPollConfigSelectionRelations>, PollConfigSelection, HasPoll {}
