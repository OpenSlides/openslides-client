import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ChatGroupControllerService } from './chat-group-controller.service';

@Injectable({
    providedIn: `root`
})
export class ChatService {
    public get canSeeChatObservable(): Observable<boolean> {
        return this._canSeeChatSubject;
    }

    private _canSeeChatSubject = new BehaviorSubject<boolean>(false);
    private _canSeeSomeChatGroup = false;
    private _canManage = false;
    private _isChatEnabled = false;

    public constructor(
        _chatGroupRepo: ChatGroupControllerService,
        _operator: OperatorService,
        _meetingSettingService: MeetingSettingsService,
        _orgaSettingService: OrganizationSettingsService
    ) {
        this._canSeeSomeChatGroup = _chatGroupRepo.getViewModelList()?.length > 0;
        this._canManage = _operator.hasPerms(Permission.chatCanManage);
        this._isChatEnabled = _orgaSettingService.instant(`enable_chat`);
        this.update();

        _chatGroupRepo.getViewModelListObservable().subscribe(groups => {
            this._canSeeSomeChatGroup = groups?.length > 0;
            this.update();
        });

        _operator.operatorUpdated.subscribe(() => {
            this._canManage = _operator.hasPerms(Permission.chatCanManage);
            this.update();
        });

        _orgaSettingService.get(`enable_chat`).subscribe(isChatEnabled => {
            this._isChatEnabled = isChatEnabled;
            this.update();
        });
    }

    private update(): void {
        this._canSeeChatSubject.next(this._isChatEnabled && (this._canSeeSomeChatGroup || this._canManage));
    }
}
