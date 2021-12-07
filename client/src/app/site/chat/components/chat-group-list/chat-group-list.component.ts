import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ViewChatGroup } from 'app/shared/models/chat/chat-groups/view-chat-group';
import { Observable } from 'rxjs';

import { Id } from '../../../../core/definitions/key-types';
import { ChatGroupRepositoryService } from '../../../../core/repositories/chat/chat-groups/chat-group-repository.service';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';
import { ViewportService } from '../../../../core/ui-services/viewport.service';
import { VerticalTabGroupContentState } from '../../../../shared/components/vertical-tab-group/vertical-tab-group.component';
import { infoDialogSettings } from '../../../../shared/utils/dialog-settings';
import { BaseComponent } from '../../../base/components/base.component';
import { ChatNotificationService } from '../../services/chat-notification.service';
import { ChatGroupDialogComponent } from '../chat-group-dialog/chat-group-dialog.component';

@Component({
    selector: `os-chat-group-list`,
    templateUrl: `./chat-group-list.component.html`,
    styleUrls: [`./chat-group-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ChatGroupListComponent extends BaseComponent {
    public get chatGroupsObservable(): Observable<ViewChatGroup[]> {
        return this.chatGroupRepo.getViewModelListObservable();
    }

    public get hasMainButton(): boolean {
        return this.permission.chatCanManage && (!this.vp.isMobile || !this.isChatContentOpen);
    }

    public get isChatContentOpen(): boolean {
        return this._isChatContentOpen;
    }

    private _isChatContentOpen = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        private dialogService: MatDialog,
        private chatGroupRepo: ChatGroupRepositoryService,
        private vp: ViewportService,
        private chatNotificationService: ChatNotificationService
    ) {
        super(componentServiceCollector, translate);
    }

    public getNotificationsObservableForChatId(chatGroupId: Id): Observable<number> {
        return this.chatNotificationService.getChatGroupNotificationsEvent(chatGroupId);
    }

    public async createChatGroup(): Promise<void> {
        const dialogRef = this.dialogService.open(ChatGroupDialogComponent, {
            ...infoDialogSettings
        });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) {
            await this.chatGroupRepo.create({ ...result, meeting_id: this.activeMeetingId });
        }
    }

    public onTabContentChanged(nextState: VerticalTabGroupContentState): void {
        this._isChatContentOpen = nextState === VerticalTabGroupContentState.OPENED;
    }
}
