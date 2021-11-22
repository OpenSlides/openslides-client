import { AppConfig } from '../../core/definitions/app-config';
import { ChatGroupRepositoryService } from '../../core/repositories/chat/chat-groups/chat-group-repository.service';
import { ChatMessageRepositoryService } from '../../core/repositories/chat/chat-messages/chat-message-repository.service';
import { ChatGroup } from '../../shared/models/chat/chat-groups/chat-group';
import { ViewChatGroup } from '../../shared/models/chat/chat-groups/view-chat-group';
import { ChatMessage } from '../../shared/models/chat/chat-messages/chat-message';
import { ViewChatMessage } from '../../shared/models/chat/chat-messages/view-chat-message';

export const CHAT_CONFIG: AppConfig = {
    name: `Chat`,
    models: [
        { model: ChatGroup, viewModel: ViewChatGroup, repository: ChatGroupRepositoryService },
        { model: ChatMessage, viewModel: ViewChatMessage, repository: ChatMessageRepositoryService }
    ]
};
