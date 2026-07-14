import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { ChatGroup } from '@app/domain/models/chat/chat-group';
import { ChatGroupRepositoryService } from '@app/gateways/repositories/chat/chat-group-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewChatGroup } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class ChatGroupControllerService extends BaseMeetingControllerService<ViewChatGroup, ChatGroup> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ChatGroupRepositoryService
    ) {
        super(controllerServiceCollector, ChatGroup, repo);
    }

    public create(chatGroup: Partial<ChatGroup>): Promise<Identifiable[]> {
        return this.repo.create(chatGroup);
    }

    public update(chatGroup: Partial<ChatGroup> & Identifiable): Promise<void> {
        return this.repo.update(chatGroup);
    }

    public delete(...chatGroups: Identifiable[]): Promise<void> {
        return this.repo.delete(...chatGroups);
    }

    public clear(chatGroup: Identifiable): Promise<void> {
        return this.repo.clear(chatGroup.id);
    }
}
