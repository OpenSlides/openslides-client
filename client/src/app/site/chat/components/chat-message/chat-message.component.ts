import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Permission } from 'app/core/core-services/permission';
import { ViewUser } from 'app/site/users/models/view-user';

import { OperatorService } from '../../../../core/core-services/operator.service';
import { ViewportService } from '../../../../core/ui-services/viewport.service';
import { ViewChatMessage } from '../../../../shared/models/chat/chat-messages/view-chat-message';

@Component({
    selector: `os-chat-message`,
    templateUrl: `./chat-message.component.html`,
    styleUrls: [`./chat-message.component.scss`]
})
export class ChatMessageComponent {
    @Input()
    public chatMessage: ViewChatMessage;

    @Output()
    public editing = new EventEmitter<ViewChatMessage>();

    @Output()
    public deleting = new EventEmitter<ViewChatMessage>();

    public get isOwnMessage(): boolean {
        return this._operator?.operatorId === this.chatMessage?.user_id || false;
    }

    public get canBeDeleted(): boolean {
        return this.isOwnMessage || this._operator.hasPerms(Permission.chatCanManage);
    }

    public get author(): string {
        return this.user?.username || ``;
    }

    public get text(): string {
        return this.chatMessage?.content || ``;
    }

    public get date(): Date {
        return new Date(this.chatMessage?.created);
    }

    public get isMobile(): boolean {
        return this._vp.isMobile;
    }

    private get user(): ViewUser | undefined {
        return this.chatMessage?.user;
    }

    public constructor(private _operator: OperatorService, private _vp: ViewportService) {}

    public onEditMessage(): void {
        this.editing.emit(this.chatMessage);
    }

    public onDeleteMessage(): void {
        this.deleting.emit(this.chatMessage);
    }
}
