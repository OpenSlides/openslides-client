import { HasMeeting } from 'app/management/models/view-meeting';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';

import { OptionData, OptionTitle } from './generic-poll';
import { Option } from './option';
import { ViewPoll } from './view-poll';
import { ViewVote } from './view-vote';

export class ViewOption<C extends BaseViewModel = any> extends BaseViewModel<Option> implements OptionData {
    public static COLLECTION = Option.COLLECTION;
    protected _collection = Option.COLLECTION;

    public getContentObject(): C | undefined {
        return this.content_object;
    }

    public getOptionTitle(): OptionTitle {
        if (this.text) {
            return { title: this.text };
        } else {
            if (this.content_object instanceof ViewUser) {
                return {
                    title: this.content_object.getShortName(),
                    subtitle: this.content_object.getLevelAndNumber()
                };
            } else {
                return { title: this.content_object.getTitle() };
            }
        }
    }
}

interface IViewOptionRelations<C extends BaseViewModel = any> {
    content_object?: C;
    votes: ViewVote[];
    poll: ViewPoll;
}

export interface ViewOption extends HasMeeting, IViewOptionRelations, Option {}
