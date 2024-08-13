import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { OptionData, OptionTitle } from '../../../../../../domain/models/poll/generic-poll';
import { Option } from '../../../../../../domain/models/poll/option';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewUser } from '../../../view-models/view-user';
import { UnknownUserLabel } from '../../assignments/modules/assignment-poll/services/assignment-poll.service';
import { isSortedList, SortedList } from './sorted-list';
import { ViewPoll } from './view-poll';
import { ViewVote } from './view-vote';
export class ViewOption<C extends BaseViewModel = any> extends BaseViewModel<Option> implements OptionData {
    public static COLLECTION = Option.COLLECTION;
    protected _collection = Option.COLLECTION;

    public get isListOption(): boolean {
        return isSortedList(this.content_object);
    }

    public get contentTitlesAsSortedArray(): OptionTitle[] {
        if (!this.isListOption) {
            return [this.getOptionTitle()];
        }
        return (this.content_object as SortedList).entries
            .sort((a, b) => a.weight - b.weight)
            .map(entry => ({ title: entry.getTitle() ?? `No data`, subtitle: entry.getSubtitle() ?? `` }));
    }

    public getContentObject(): C | undefined {
        return this.content_object;
    }

    public getOptionTitle(): OptionTitle {
        if (this.text) {
            return { title: this.text };
        } else {
            if (this.isListOption) {
                return {
                    title: this.content_object.getTitle()
                };
            } else if (this.content_object instanceof ViewUser) {
                return {
                    title: this.content_object.getShortName(),
                    subtitle: this.content_object.getLevelAndNumber()
                };
            } else if (this.poll.isAssignmentPoll && !this.content_object_id) {
                return {
                    title: UnknownUserLabel,
                    subtitle: ``
                };
            } else if (this.poll.isAssignmentPoll) {
                return { title: `` };
            } else {
                return { title: this.content_object?.getTitle() ?? _(`No data`) };
            }
        }
    }
}

interface IViewOptionRelations<C extends BaseViewModel = any> {
    content_object?: C;
    votes: ViewVote[];
    poll: ViewPoll;
    used_as_global_option_in_poll: ViewPoll;
}

export interface ViewOption extends HasMeeting, ViewModelRelations<IViewOptionRelations>, Option {}
