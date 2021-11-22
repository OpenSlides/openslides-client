import { HasMeeting } from 'app/management/models/view-meeting';

import { BaseViewModel } from '../../../../site/base/base-view-model';
import { ViewUser } from '../../../../site/users/models/view-user';
import { ViewChatGroup } from '../chat-groups/view-chat-group';
import { ChatMessage } from './chat-message';

export class ViewChatMessage extends BaseViewModel<ChatMessage> {
    public static readonly COLLECTION = ChatMessage.COLLECTION;

    public getCreationDate(): Date {
        return new Date(this.created * 1000);
    }
}

export interface ViewChatMessage extends ChatMessage, ViewChatMessageRelations {}

interface ViewChatMessageRelations extends HasMeeting {
    user: ViewUser;
    chat_group: ViewChatGroup;
}
