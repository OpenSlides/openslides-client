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

    public get invalidBallots(): number | null {
        return this.parsedResult()?.invalid ?? null;
    }

    public get onehundredPercentBaseNum(): number | null {
        throw Error('not implemented');
    }

    public get totalVotes(): number | null {
        throw Error('not implemented');
    }
}

interface IPollConfigSelectionRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigSelection
    extends ViewModelRelations<IPollConfigSelectionRelations>, PollConfigSelection, HasPoll {}
