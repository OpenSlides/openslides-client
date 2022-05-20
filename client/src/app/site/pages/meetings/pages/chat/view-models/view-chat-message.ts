import { ChatMessage } from '../../../../../../domain/models/chat/chat-message';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewUser } from '../../../view-models/view-user';
import { ViewChatGroup } from './view-chat-group';

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
