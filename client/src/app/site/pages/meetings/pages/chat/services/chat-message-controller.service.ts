import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { ChatMessage } from 'src/app/domain/models/chat/chat-message';
import { ChatMessageRepositoryService } from 'src/app/gateways/repositories/chat/chat-message-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

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
