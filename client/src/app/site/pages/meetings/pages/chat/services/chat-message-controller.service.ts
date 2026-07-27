import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { ChatMessage } from '@app/domain/models/chat/chat-message';
import { ChatMessageRepositoryService } from '@app/gateways/repositories/chat/chat-message-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewChatMessage } from '../view-models';

@Service()
export class ChatMessageControllerService extends BaseMeetingControllerService<ViewChatMessage, ChatMessage> {
    protected override repo: ChatMessageRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(ChatMessageRepositoryService);
        super(controllerServiceCollector, ChatMessage, repo);
    }

    public create(chatMessage: Partial<ChatMessage>): Promise<Identifiable[]> {
        return this.repo.create(chatMessage);
    }

    public update(chatMessage: Partial<ChatMessage> & Identifiable): Promise<void> {
        return this.repo.update(chatMessage);
    }

    public delete(chatMessage: Identifiable): Promise<void> {
        return this.repo.delete(chatMessage.id);
    }
}
