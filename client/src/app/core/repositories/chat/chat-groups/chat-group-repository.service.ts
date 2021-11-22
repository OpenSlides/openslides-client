import { Injectable } from '@angular/core';
import { ChatGroupAction } from 'app/core/actions/chat-group-action';
import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ViewChatGroup } from 'app/shared/models/chat/chat-groups/view-chat-group';

import { ChatGroup } from '../../../../shared/models/chat/chat-groups/chat-group';
import { DEFAULT_FIELDSET } from '../../../core-services/model-request-builder.service';
import { BaseRepositoryWithActiveMeeting } from '../../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../../repository-service-collector';

@Injectable({ providedIn: `root` })
export class ChatGroupRepositoryService extends BaseRepositoryWithActiveMeeting<ViewChatGroup, ChatGroup> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ChatGroup);
    }

    public getVerboseName = (plural?: boolean) => (plural ? `Chat groups` : `Chat group`);
    public getTitle = (viewModel: ViewChatGroup) => viewModel.name;
    public getFieldsets(): Fieldsets<ChatGroup> {
        const detailFieldset: (keyof ChatGroup)[] = [
            `chat_message_ids`,
            `name`,
            `weight`,
            `read_group_ids`,
            `write_group_ids`
        ];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }

    public create(...data: ChatGroupAction.CreatePayload[]): Promise<Identifiable[]> {
        const payload: ChatGroupAction.CreatePayload[] = data.map(partialChatGroup => partialChatGroup);
        return this.sendBulkActionToBackend(ChatGroupAction.CREATE, payload);
    }

    public update(...update: ChatGroupAction.UpdatePayload[]): Promise<void> {
        const payload: ChatGroupAction.UpdatePayload[] = update.map(partialChatGroup => partialChatGroup);
        return this.sendBulkActionToBackend(ChatGroupAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Promise<void> {
        const payload: ChatGroupAction.DeletePayload[] = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ChatGroupAction.DELETE, payload);
    }

    public sort(sortedIds: Id[], meetingId: Id = this.activeMeetingId): Promise<void> {
        const payload: ChatGroupAction.SortPayload = { meeting_id: meetingId, chat_group_ids: sortedIds };
        return this.sendActionToBackend(ChatGroupAction.SORT, payload);
    }

    public clear(...ids: Id[]): Promise<void> {
        const payload: ChatGroupAction.ClearPayload[] = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ChatGroupAction.CLEAR, payload);
    }
}
