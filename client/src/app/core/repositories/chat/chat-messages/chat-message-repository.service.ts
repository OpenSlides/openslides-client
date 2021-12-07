import { Injectable } from '@angular/core';
import { ChatMessageAction } from 'app/core/actions/chat-message-action';
import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { ChatMessage } from '../../../../shared/models/chat/chat-messages/chat-message';
import { ViewChatMessage } from '../../../../shared/models/chat/chat-messages/view-chat-message';
import { DEFAULT_FIELDSET } from '../../../core-services/model-request-builder.service';
import { BaseRepositoryWithActiveMeeting } from '../../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../../repository-service-collector';

/**
 * Maximum number of characters per chat message
 */
export const CHAT_MESSAGE_MAX_LENGTH = 512;

@Injectable({ providedIn: `root` })
export class ChatMessageRepositoryService extends BaseRepositoryWithActiveMeeting<ViewChatMessage, ChatMessage> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ChatMessage);
    }

    public getVerboseName = (plural?: boolean) => (plural ? `Chat messages` : `Chat message`);
    public getTitle = () => `No name`;
    public getFieldsets(): Fieldsets<ChatMessage> {
        const detailFields: (keyof ChatMessage)[] = [`chat_group_id`, `content`, `created`, `user_id`];
        return {
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public create(...data: ChatMessageAction.CreatePayload[]): Promise<Identifiable[]> {
        const payload: ChatMessageAction.CreatePayload[] = data.map(partialChatMessage => partialChatMessage);
        return this.sendBulkActionToBackend(ChatMessageAction.CREATE, payload);
    }

    public update(...update: ChatMessageAction.UpdatePayload[]): Promise<void> {
        const payload: ChatMessageAction.UpdatePayload[] = update;
        return this.sendBulkActionToBackend(ChatMessageAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Promise<void> {
        const payload: ChatMessageAction.DeletePayload[] = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ChatMessageAction.DELETE, payload);
    }
}
