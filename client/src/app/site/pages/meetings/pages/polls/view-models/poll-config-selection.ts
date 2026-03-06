import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollConfigOption } from '..';

export class ViewPollConfigSelection extends BaseViewModel<PollConfigSelection> {
    public get poll_config_selection(): PollConfigSelection {
        return this._model;
    }

    public static COLLECTION = PollConfigSelection.COLLECTION;
}

interface IPollConfigSelectionRelations {
    options: ViewPollConfigOption[];
}
export interface ViewPollConfigSelection
    extends ViewModelRelations<IPollConfigSelectionRelations>, PollConfigSelection, HasPoll {}
