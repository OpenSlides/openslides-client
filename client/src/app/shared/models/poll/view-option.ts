import { HasMeeting } from 'app/management/models/view-meeting';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { Option } from './option';
import { ViewPoll } from './view-poll';
import { ViewVote } from './view-vote';

export class ViewOption<C extends BaseViewModel = any> extends BaseViewModel<Option> {
    public static COLLECTION = Option.COLLECTION;
    protected _collection = Option.COLLECTION;

    public getContentObject(): C | undefined {
        return this.content_object;
    }
}

interface IViewOptionRelations<C extends BaseViewModel = any> {
    content_object?: C;
    votes: ViewVote[];
    poll: ViewPoll;
}

export interface ViewOption extends HasMeeting, IViewOptionRelations, Option {}
