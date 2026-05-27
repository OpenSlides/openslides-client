import { PollConfigStvScottish } from 'src/app/domain/models/poll/poll-config-stv-scottish';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export class ViewPollConfigStvScottish extends BasePollConfigViewModel<PollConfigStvScottish, unknown> {
    public get poll_config_stv_scottish(): PollConfigStvScottish {
        return this._model;
    }

    public static COLLECTION = PollConfigStvScottish.COLLECTION;
}

interface IPollConfigStvScottishRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigStvScottish
    extends ViewModelRelations<IPollConfigStvScottishRelations>, PollConfigStvScottish, HasPoll {}
