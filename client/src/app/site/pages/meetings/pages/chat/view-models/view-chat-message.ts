import { ChatMessage } from '../../../../../../domain/models/chat/chat-message';
import { BaseHasMeetingUserViewModel } from '../../../base/base-has-meeting-user-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewChatGroup } from './view-chat-group';

export class ViewChatMessage extends BaseHasMeetingUserViewModel<ChatMessage> {
    public static readonly COLLECTION = ChatMessage.COLLECTION;

    public getCreationDate(): Date {
        return new Date(this.created * 1000);
    }
}

export interface ViewChatMessage extends ChatMessage, ViewChatMessageRelations {}
interface ViewChatMessageRelations extends HasMeeting {
    chat_group: ViewChatGroup;
}
