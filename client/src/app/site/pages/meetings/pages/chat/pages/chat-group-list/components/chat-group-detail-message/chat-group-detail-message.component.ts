import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { ViewChatMessage } from '@app/site/pages/meetings/pages/chat';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { ViewPortService } from '@app/site/services/view-port.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: `os-chat-group-detail-message`,
    templateUrl: `./chat-group-detail-message.component.html`,
    styleUrls: [`./chat-group-detail-message.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChatGroupDetailMessageComponent {
    @Input()
    public chatMessage!: ViewChatMessage;

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
        if (!this.chatMessage.meeting_user_id) {
            return this.translate.instant(`removed user`);
        } else if (this.user) {
            return this.user.short_name;
        }
        return ``;
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

    private translate = inject(TranslateService);

    public constructor(
        private _operator: OperatorService,
        private _vp: ViewPortService
    ) {}

    public onEditMessage(): void {
        this.editing.emit(this.chatMessage);
    }

    public onDeleteMessage(): void {
        this.deleting.emit(this.chatMessage);
    }
}
