import { PollConfigStvScottish } from 'src/app/domain/models/poll/poll-config-stv-scottish';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewPoll, ViewPollConfigOption } from '..';

export class ViewPollConfigStvScottish extends BaseViewModel<PollConfigStvScottish> {
    public get poll_config_stv_scottish(): PollConfigStvScottish {
        return this._model;
    }

    public static COLLECTION = PollConfigStvScottish.COLLECTION;
}

interface IPollConfigStvScottishRelations {
    poll: ViewPoll;
    options: ViewPollConfigOption[];
}
export interface ViewPollConfigStvScottish extends ViewModelRelations<IPollConfigStvScottishRelations>, PollConfigStvScottish { }
