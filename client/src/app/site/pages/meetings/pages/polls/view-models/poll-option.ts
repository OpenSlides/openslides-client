import { OptionTitle } from 'src/app/domain/models/poll';
import { PollOption } from 'src/app/domain/models/poll/poll-option';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewPoll } from '..';

export class ViewPollOption extends BaseViewModel<PollOption> {
    public get poll_config_option(): PollOption {
        return this._model;
    }

    public get isListOption(): boolean {
        throw new Error(`Not implemented`);
    }

    public getOptionTitle(): OptionTitle {
        return {
            title: this.text
        };
    }

    public get contentTitlesAsSortedArray(): OptionTitle[] {
        throw new Error(`Not implemented`);
    }

    public static COLLECTION = PollOption.COLLECTION;
}

interface IPollConfigOptionRelations {
    poll: ViewPoll;
    meeting_user: ViewMeetingUser;
}
export interface ViewPollOption extends ViewModelRelations<IPollConfigOptionRelations>, PollOption {}
