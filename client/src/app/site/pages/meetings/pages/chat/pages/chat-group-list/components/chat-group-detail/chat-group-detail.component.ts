import { CdkVirtualScrollViewport, ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewChatGroup, ViewChatMessage } from 'src/app/site/pages/meetings/pages/chat';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import {
    ChatGroupDialogData,
    ChatGroupDialogService
} from '../../../../modules/chat-group-dialog/services/chat-group-dialog.service';
import { ChatGroupControllerService, ChatNotificationService } from '../../../../services';
import { ChatMessageControllerService } from '../../../../services/chat-message-controller.service';

@Component({
    selector: `os-chat-group-detail`,
    templateUrl: `./chat-group-detail.component.html`,
    styleUrls: [`./chat-group-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatGroupDetailComponent extends BaseMeetingComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(CdkVirtualScrollViewport)
    private _virtualScrollViewPort!: CdkVirtualScrollViewport;

    @Input()
    public chatGroup!: ViewChatGroup;

    @Output()
    public backButtonClicked = new EventEmitter<void>();

    public get chatGroupObservable(): Observable<ViewChatGroup> {
        return this.repo.getViewModelObservable(this.chatGroup!.id) as Observable<ViewChatGroup>;
    }

    public get toEditChatMessageObservable(): Observable<ViewChatMessage | null> {
        return this._toEditChatMessageSubject;
    }

    public get hasWritePermissionsObservable(): Observable<boolean> {
        return this._hasWritePermissionsObservable;
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.chatCanManage);
    }

    public get isMobileObservable(): Observable<boolean> {
        return this.vp.isMobileSubject;
    }

    private get isOnBottomOfChat(): boolean {
        return this._virtualScrollViewPort.measureScrollOffset(`bottom`) === 0;
    }

    private _toEditChatMessageSubject = new BehaviorSubject<ViewChatMessage | null>(null);
    private _shouldScrollToBottom = true;
    private _hasWritePermissionsObservable: Observable<boolean> = of(false); // Not initialized

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private repo: ChatGroupControllerService,
        private chatMessageRepo: ChatMessageControllerService,
        private chatNotificationService: ChatNotificationService,
        private promptService: PromptService,
        private cd: ChangeDetectorRef,
        private dialog: ChatGroupDialogService,
        private fb: UntypedFormBuilder,
        private vp: ViewPortService,
        private operator: OperatorService
    ) {
        super();
    }

    public ngOnInit(): void {
        this._hasWritePermissionsObservable = this.chatGroupObservable.pipe(
            map(chatGroup => this.canManage || this.operator.isInGroupIds(...(chatGroup?.write_group_ids || [])))
        );
        this.chatNotificationService.openChatGroup(this.chatGroup.id);
        this.subscriptions.push(
            this.chatMessageRepo.getViewModelListObservable().subscribe(() => {
                if (this._shouldScrollToBottom) {
                    this.scrollToBottom();
                    this.triggerUpdateView();
                }
            })
        );
    }

    public ngAfterViewInit(): void {
        this.scrollToBottom();
        this.triggerUpdateView();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.chatNotificationService.closeChatGroup(this.chatGroup.id);
    }

    public onScrolledIndexChanged(): void {
        this._shouldScrollToBottom = this.isOnBottomOfChat;
    }

    public async sendChatMessage(content: string): Promise<void> {
        if (!content) {
            return;
        }
        if (this._toEditChatMessageSubject.value) {
            await this.updateChatMessage(content);
        } else {
            await this.createChatMessage(content);
        }
        this.cancelEditingChatMessage();
    }

    public async clearChatGroup(chatGroup: ViewChatGroup): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to clear all messages in this chat?`);
        const content = chatGroup.name;
        if (await this.promptService.open(title, content)) {
            await this.repo.clear(chatGroup).catch(this.raiseError);
            this.triggerUpdateView();
        }
    }

    public async editChatGroup(chatGroup: ViewChatGroup): Promise<void> {
        const chatData: ChatGroupDialogData = {
            name: chatGroup.name,
            read_group_ids: chatGroup.read_group_ids,
            write_group_ids: chatGroup.write_group_ids
        };

        const dialogRef = await this.dialog.open(chatData);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.saveChanges(res);
            }
        });
    }

    public async deleteChatGroup(chatGroup: ViewChatGroup): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this chat group?`);
        const content = chatGroup.name;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(chatGroup).catch(this.raiseError);
            this.triggerUpdateView();
        }
    }

    public prepareEditingChatMessage(message: ViewChatMessage): void {
        this._toEditChatMessageSubject.next(message);
    }

    public cancelEditingChatMessage(): void {
        this._toEditChatMessageSubject.next(null);
    }

    public async deleteChatMessage(message: ViewChatMessage): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this message?`);
        if (await this.promptService.open(title)) {
            await this.chatMessageRepo.delete(message).catch(this.raiseError);
            this.triggerUpdateView();
        }
    }

    public getReadonlyGroups(chatGroup: ViewChatGroup): ViewGroup[] {
        const readGroups = chatGroup.read_groups;
        const writeGroups = chatGroup.write_group_ids || [];
        return readGroups.filter(group => !writeGroups.includes(group.id));
    }

    private async saveChanges(update: ChatGroupDialogData): Promise<void> {
        this.repo.update({ id: this.chatGroup.id, ...update });
    }

    private async updateChatMessage(content: UnsafeHtml): Promise<void> {
        await this.chatMessageRepo.update({ content, id: this._toEditChatMessageSubject.value!.id });
    }

    private async createChatMessage(content: UnsafeHtml): Promise<void> {
        await this.chatMessageRepo.create({ content, chat_group_id: this.chatGroup.id });
    }

    private scrollToBottom(): void {
        /**
         * I am aware that this is ugly, but that is the only way to get to
         * the bottom reliably
         * https://stackoverflow.com/questions/64932671/scroll-to-bottom-with-cdk-virtual-scroll-angular-8/65069130
         */
        const scrollTarget: ExtendedScrollToOptions = {
            bottom: 0,
            behavior: `auto`
        };
        setTimeout(() => {
            this._virtualScrollViewPort?.scrollTo(scrollTarget);
        }, 0);
        setTimeout(() => {
            this._virtualScrollViewPort?.scrollTo(scrollTarget);
        }, 100);
    }

    private triggerUpdateView(): void {
        this.cd.markForCheck();
    }
}
