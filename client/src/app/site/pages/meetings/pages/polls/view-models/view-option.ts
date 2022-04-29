import { Option } from '../../../../../../domain/models/poll/option';
import { OptionData, OptionTitle } from '../../../../../../domain/models/poll/generic-poll';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { ViewUser } from '../../../view-models/view-user';
import { ViewVote } from './view-vote';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewPoll } from './view-poll';
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
