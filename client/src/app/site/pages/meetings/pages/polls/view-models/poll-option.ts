import { OptionTitle } from '@app/domain/models/poll';
import { PollOption } from '@app/domain/models/poll/poll-option';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';

export class ViewPollOption extends BaseViewModel<PollOption> {
    public get poll_config_option(): PollOption {
        return this._model;
    }

    public getOptionTitleShort(): string {
        if (this.content_object instanceof ViewMeetingUser) {
            return this.content_object?.user?.getName();
        } else if (this.content_object instanceof ViewUser) {
            return this.content_object?.getName();
        }

        return this.text;
    }

    public getOptionTitleLong(): string {
        if (this.content_object instanceof ViewMeetingUser) {
            return this.content_object?.user?.getName();
        } else if (this.content_object instanceof ViewUser) {
            return this.content_object?.getName();
        }

        return this.text;
    }

    public getOptionTitle(): OptionTitle {
        if (this.content_object instanceof ViewMeetingUser) {
            return {
                title: this.content_object?.user?.getName(),
                subtitle: this.content_object?.structureLevels()
            };
        } else if (this.content_object instanceof ViewUser) {
            return {
                title: this.content_object?.getName(),
                subtitle: this.content_object?.structureLevels()
            };
        }

        return {
            title: this.text
        };
    }

    public static COLLECTION = PollOption.COLLECTION;
}

interface IPollConfigOptionRelations {
    poll: ViewPoll;
    content_object?: ViewMeetingUser | ViewUser;
}
export interface ViewPollOption extends ViewModelRelations<IPollConfigOptionRelations>, PollOption {}
