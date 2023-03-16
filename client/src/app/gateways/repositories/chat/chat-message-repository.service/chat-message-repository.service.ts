import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { ChatMessage } from 'src/app/domain/models/chat/chat-message';
import { ViewChatMessage } from 'src/app/site/pages/meetings/pages/chat';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { ChatMessageAction } from './chat-message.action';

/**
 * Maximum number of characters per chat message
 */
export const CHAT_MESSAGE_MAX_LENGTH = 512;

@Injectable({ providedIn: `root` })
export class ChatMessageRepositoryService extends BaseMeetingRelatedRepository<ViewChatMessage, ChatMessage> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, ChatMessage);
    }

    public getVerboseName = (plural?: boolean) => (plural ? `Chat messages` : `Chat message`);
    public getTitle = () => `No name`;

    public create(...data: any[]): Promise<Identifiable[]> {
        const payload = data.map(partialChatMessage => partialChatMessage);
        return this.sendBulkActionToBackend(ChatMessageAction.CREATE, payload);
    }

    public update(...update: any[]): Promise<void> {
        const payload = update;
        return this.sendBulkActionToBackend(ChatMessageAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Promise<void> {
        const payload = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ChatMessageAction.DELETE, payload);
    }
}
