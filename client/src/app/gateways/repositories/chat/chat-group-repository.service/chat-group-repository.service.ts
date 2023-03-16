import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { ChatGroup } from 'src/app/domain/models/chat/chat-group';
import { ViewChatGroup } from 'src/app/site/pages/meetings/pages/chat';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { ChatGroupAction } from './chat-group.action';

@Injectable({
    providedIn: `root`
})
export class ChatGroupRepositoryService extends BaseMeetingRelatedRepository<ViewChatGroup, ChatGroup> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, ChatGroup);
    }

    public getVerboseName = (plural?: boolean) => (plural ? `Chat groups` : `Chat group`);
    public getTitle = (viewModel: ViewChatGroup) => viewModel.name;

    public create(...data: Partial<ChatGroup>[]): Promise<Identifiable[]> {
        const payload: any[] = data.map(partialChatGroup => partialChatGroup);
        return this.sendBulkActionToBackend(ChatGroupAction.CREATE, payload);
    }

    public update(...update: (Partial<ChatGroup> & Identifiable)[]): Promise<void> {
        const payload: any[] = update.map(partialChatGroup => partialChatGroup);
        return this.sendBulkActionToBackend(ChatGroupAction.UPDATE, payload);
    }

    public delete(...ids: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = ids.map(id => ({ id: id.id }));
        return this.sendBulkActionToBackend(ChatGroupAction.DELETE, payload);
    }

    public sort(sortedIds: Id[], meetingId: Id | null = this.activeMeetingId): Promise<void> {
        const payload = { meeting_id: meetingId, chat_group_ids: sortedIds };
        return this.sendActionToBackend(ChatGroupAction.SORT, payload);
    }

    public clear(...ids: Id[]): Promise<void> {
        const payload = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ChatGroupAction.CLEAR, payload);
    }
}
