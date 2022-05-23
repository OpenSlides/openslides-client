import { ChatGroup } from 'src/app/domain/models/chat/chat-group';
import { ChatMessage } from 'src/app/domain/models/chat/chat-message';
import { ChatGroupRepositoryService } from 'src/app/gateways/repositories/chat/chat-group-repository.service';
import { ChatMessageRepositoryService } from 'src/app/gateways/repositories/chat/chat-message-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import { ViewChatGroup, ViewChatMessage } from './view-models';

export const ChatAppConfig: AppConfig = {
    name: `Chat`,
    models: [
        { model: ChatGroup, viewModel: ViewChatGroup, repository: ChatGroupRepositoryService },
        { model: ChatMessage, viewModel: ViewChatMessage, repository: ChatMessageRepositoryService }
    ]
};
