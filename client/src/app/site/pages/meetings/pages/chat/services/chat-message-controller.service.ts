import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { ChatMessage } from '@app/domain/models/chat/chat-message';
import { ChatMessageRepositoryService } from '@app/gateways/repositories/chat/chat-message-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewChatMessage } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class ChatMessageControllerService extends BaseMeetingControllerService<ViewChatMessage, ChatMessage> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ChatMessageRepositoryService
    ) {
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
