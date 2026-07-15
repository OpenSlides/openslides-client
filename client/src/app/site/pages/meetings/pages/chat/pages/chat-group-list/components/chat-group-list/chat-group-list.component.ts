import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { BaseMeetingComponent } from '@app/site/pages/meetings/base/base-meeting.component';
import { ViewChatGroup } from '@app/site/pages/meetings/pages/chat';
import { OperatorService } from '@app/site/services/operator.service';
import { ViewPortService } from '@app/site/services/view-port.service';
import { VerticalTabGroupContentState } from '@app/ui/modules/vertical-tab-group';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';

import { ChatGroupDialogService } from '../../../../modules/chat-group-dialog/services/chat-group-dialog.service';
import { ChatGroupControllerService, ChatNotificationService } from '../../../../services';

@Component({
    selector: `os-chat-group-list`,
    templateUrl: `./chat-group-list.component.html`,
    styleUrls: [`./chat-group-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ChatGroupListComponent extends BaseMeetingComponent implements OnInit {
    public get chatGroupsObservable(): Observable<ViewChatGroup[]> {
        return this.chatGroupRepo.getViewModelListObservable();
    }

    public get hasMainButton(): boolean {
        return this.operator.hasPerms(this.permission.chatCanManage) && (!this.vp.isMobile || !this.isChatContentOpen);
    }

    public get isChatContentOpen(): boolean {
        return this._isChatContentOpen;
    }

    private _isChatContentOpen = false;

    public constructor(
        protected override translate: TranslateService,
        private dialog: ChatGroupDialogService,
        private chatGroupRepo: ChatGroupControllerService,
        private vp: ViewPortService,
        private chatNotificationService: ChatNotificationService,
        private operator: OperatorService
    ) {
        super();
    }

    public ngOnInit(): void {
        super.setTitle(`Chat`);
    }

    public getNotificationsObservableForChatId(chatGroupId: Id): Observable<number> {
        return this.chatNotificationService.getChatGroupNotificationsEvent(chatGroupId);
    }

    public async createChatGroup(): Promise<void> {
        const dialogRef = await this.dialog.open();
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            await this.chatGroupRepo.create({ ...result, meeting_id: this.activeMeetingId! });
        }
    }

    public onTabContentChanged(nextState: VerticalTabGroupContentState): void {
        this._isChatContentOpen = nextState === VerticalTabGroupContentState.OPENED;
    }
}
