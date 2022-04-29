import { CdkVirtualScrollViewport, ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ViewChatMessage } from 'app/shared/models/chat/chat-messages/view-chat-message';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewGroup } from 'app/site/users/models/view-group';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { OperatorService } from '../../../../core/core-services/operator.service';
import { UnsafeHtml } from '../../../../core/definitions/key-types';
import { ChatGroupRepositoryService } from '../../../../core/repositories/chat/chat-groups/chat-group-repository.service';
import {
    CHAT_MESSAGE_MAX_LENGTH,
    ChatMessageRepositoryService
} from '../../../../core/repositories/chat/chat-messages/chat-message-repository.service';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';
import { PromptService } from '../../../../core/ui-services/prompt.service';
import { ViewportService } from '../../../../core/ui-services/viewport.service';
import { ViewChatGroup } from '../../../../shared/models/chat/chat-groups/view-chat-group';
import { BaseComponent } from '../../../base/components/base.component';
import { ChatNotificationService } from '../../services/chat-notification.service';
import { ChatGroupDialogComponent, ChatGroupDialogData } from '../chat-group-dialog/chat-group-dialog.component';

@Component({
    selector: `os-chat-group-detail`,
    templateUrl: `./chat-group-detail.component.html`,
    styleUrls: [`./chat-group-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatGroupDetailComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(CdkVirtualScrollViewport)
    private _virtualScrollViewPort: CdkVirtualScrollViewport;

    @Input()
    public chatGroup: ViewChatGroup;

    @Output()
    public backButtonClicked = new EventEmitter<void>();

    public newMessageForm: FormControl;

    public get chatMessageMaxLength(): number {
        return CHAT_MESSAGE_MAX_LENGTH;
    }

    public get chatGroupObservable(): Observable<ViewChatGroup> {
        return this.repo.getViewModelObservable(this.chatGroup?.id);
    }

    public get isEditingChatMessageObservable(): Observable<boolean> {
        return this._toEditChatMessageSubject.pipe(map(value => !!value));
    }

    public get hasWritePermissionsObservable(): Observable<boolean> {
        return this._hasWritePermissionsObservable;
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(this.permission.chatCanManage);
    }

    public get isMobileObservable(): Observable<boolean> {
        return this.vp.isMobileSubject.asObservable();
    }

    private get isOnBottomOfChat(): boolean {
        return this._virtualScrollViewPort.measureScrollOffset(`bottom`) === 0;
    }

    private _toEditChatMessageSubject = new BehaviorSubject<ViewChatMessage | null>(null);
    private _shouldScrollToBottom = true;
    private _hasWritePermissionsObservable: Observable<boolean> = of(false); // Not initialized

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        private repo: ChatGroupRepositoryService,
        private chatMessageRepo: ChatMessageRepositoryService,
        private chatNotificationService: ChatNotificationService,
        private promptService: PromptService,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private vp: ViewportService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this._hasWritePermissionsObservable = this.chatGroupObservable.pipe(
            map(
                chatGroup =>
                    chatGroup && (this.canManage || this.operator.isInGroupIds(...(chatGroup.write_group_ids || [])))
            )
        );
        this.chatNotificationService.openChatGroup(this.chatGroup.id);
        this.newMessageForm = this.fb.control(``, [Validators.required, Validators.maxLength(CHAT_MESSAGE_MAX_LENGTH)]);
        this.subscriptions.push(
            this.newMessageForm.valueChanges.subscribe(text => {
                if (!text) {
                    this.newMessageForm.markAsUntouched();
                    this.newMessageForm.setErrors(null);
                }
            }),
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

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.chatNotificationService.closeChatGroup(this.chatGroup.id);
    }

    public onScrolledIndexChanged(): void {
        this._shouldScrollToBottom = this.isOnBottomOfChat;
    }

    public async sendChatMessage(): Promise<void> {
        const content = this.newMessageForm.value?.trim() as string;
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
            await this.repo.clear(chatGroup.id).catch(this.raiseError);
            this.triggerUpdateView();
        }
    }

    public async editChatGroup(chatGroup: ViewChatGroup): Promise<void> {
        const chatData: ChatGroupDialogData = {
            name: chatGroup.name,
            read_group_ids: chatGroup.read_group_ids,
            write_group_ids: chatGroup.write_group_ids
        };

        const dialogRef = this.dialog.open(ChatGroupDialogComponent, {
            data: chatData,
            ...infoDialogSettings
        });

        dialogRef.afterClosed().subscribe((res: ChatGroupDialogData) => {
            if (res) {
                this.saveChanges(res);
            }
        });
    }

    public async deleteChatGroup(chatGroup: ViewChatGroup): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this chat group?`);
        const content = chatGroup.name;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(chatGroup.id).catch(this.raiseError);
            this.triggerUpdateView();
        }
    }

    public prepareEditingChatMessage(message: ViewChatMessage): void {
        this.newMessageForm.patchValue(message.content);
        this._toEditChatMessageSubject.next(message);
    }

    public cancelEditingChatMessage(): void {
        this.newMessageForm.patchValue(``);
        this._toEditChatMessageSubject.next(null);
    }

    public async deleteChatMessage(message: ViewChatMessage): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this message?`);
        if (await this.promptService.open(title)) {
            await this.chatMessageRepo.delete(message.id).catch(this.raiseError);
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
        await this.chatMessageRepo.update({ content, id: this._toEditChatMessageSubject.value.id });
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
