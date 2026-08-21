import { ChatGroup } from '@app/domain/models/chat/chat-group';
import { ChatMessage } from '@app/domain/models/chat/chat-message';
import { ChatGroupRepositoryService } from '@app/gateways/repositories/chat/chat-group-repository.service';
import { ChatMessageRepositoryService } from '@app/gateways/repositories/chat/chat-message-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewChatGroup, ViewChatMessage } from './view-models';

export const ChatAppConfig: AppConfig = {
    name: `Chat`,
    models: [
        { model: ChatGroup, viewModel: ViewChatGroup, repository: ChatGroupRepositoryService },
        { model: ChatMessage, viewModel: ViewChatMessage, repository: ChatMessageRepositoryService }
    ]
};
