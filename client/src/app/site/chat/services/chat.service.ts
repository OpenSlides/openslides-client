import { Injectable } from '@angular/core';
import { Permission } from 'app/core/core-services/permission';
import { BehaviorSubject, Observable } from 'rxjs';

import { OperatorService } from '../../../core/core-services/operator.service';
import { ChatGroupRepositoryService } from '../../../core/repositories/chat/chat-groups/chat-group-repository.service';
import { MeetingSettingsService } from '../../../core/ui-services/meeting-settings.service';
import { OrganizationSettingsService } from '../../../core/ui-services/organization-settings.service';

@Injectable({
    providedIn: `root`
})
export class ChatService {
    public get canSeeChatObservable(): Observable<boolean> {
        return this._canSeeChatSubject.asObservable();
    }

    private _canSeeChatSubject = new BehaviorSubject<boolean>(false);
    private _canSeeSomeChatGroup = false;
    private _canManage = false;
    private _isChatEnabled = false;

    public constructor(
        _chatGroupRepo: ChatGroupRepositoryService,
        _operator: OperatorService,
        _meetingSettingService: MeetingSettingsService,
        _orgaSettingService: OrganizationSettingsService
    ) {
        _chatGroupRepo.getViewModelListBehaviorSubject().subscribe(groups => {
            this._canSeeSomeChatGroup = groups?.length > 0;
            this.update();
        });

        _operator.operatorUpdatedEvent.subscribe(() => {
            this._canManage = _operator.hasPerms(Permission.chatCanManage);
            this.update();
        });

        _orgaSettingService.get(`enable_chat`).subscribe(isChatEnabled => (this._isChatEnabled = isChatEnabled));
    }

    private update(): void {
        this._canSeeChatSubject.next(this._isChatEnabled && (this._canSeeSomeChatGroup || this._canManage));
    }
}
