import { Observable } from 'rxjs';

import { HasMeeting } from '../../../../management/models/view-meeting';
import { BaseViewModel } from '../../../../site/base/base-view-model';
import { ViewGroup } from '../../../../site/users/models/view-group';
import { ViewChatMessage } from '../chat-messages/view-chat-message';
import { ChatGroup } from './chat-group';

export class ViewChatGroup extends BaseViewModel<ChatGroup> {
    public static readonly COLLECTION = ChatGroup.COLLECTION;

    public get chat_group(): ChatGroup {
        return this._model;
    }
}

export interface ViewChatGroup extends ChatGroup, ViewChatGroupRelations {}

interface ViewChatGroupRelations extends HasMeeting {
    read_groups: ViewGroup[];
    write_groups: ViewGroup[];
    chat_messages: ViewChatMessage[];
    chat_messages_as_observable: Observable<ViewChatMessage[]>;
}
