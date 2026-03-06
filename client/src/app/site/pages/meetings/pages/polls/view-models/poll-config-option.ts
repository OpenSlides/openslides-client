import { PollConfigOption } from 'src/app/domain/models/poll/poll-config-option';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import {
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection,
    ViewPollConfigStvScottish
} from '..';

export class ViewPollConfigOption extends BaseViewModel<PollConfigOption> {
    public get poll_config_option(): PollConfigOption {
        return this._model;
    }

    public static COLLECTION = PollConfigOption.COLLECTION;
}

interface IPollConfigOptionRelations {
    poll_config:
        | ViewPollConfigSelection
        | ViewPollConfigRatingApproval
        | ViewPollConfigRatingScore
        | ViewPollConfigStvScottish
        | ViewPollConfigApproval;
}
export interface ViewPollConfigOption extends ViewModelRelations<IPollConfigOptionRelations>, PollConfigOption {}
