import { ChatGroup } from '../../../../../../domain/models/chat/chat-group';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewGroup } from '../../participants/modules/groups/view-models/view-group';
import { ViewChatMessage } from './view-chat-message';
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
}
