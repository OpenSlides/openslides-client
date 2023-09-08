import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { NotifyService } from 'src/app/gateways/notify.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewChatMessage } from '../view-models';
import { ChatMessageControllerService } from './chat-message-controller.service';

export interface NotificationAmountEvent {
    [chatGroupId: number]: BehaviorSubject<number>;
}

function isLastSeenTimestampEvent(toCheck: unknown): toCheck is LastSeenTimestampEvent {
    if (!toCheck || typeof toCheck !== `object`) {
        return false;
    }
    const copy = toCheck as object;
    return Object.entries(copy).every(([key, value]) => {
        return Number(key) > 0 && !isNaN(new Date(value).getTime());
    });
}

interface LastSeenTimestampEvent {
    [chatGroupId: number]: Date;
}

const STORAGE_KEY = `os4-chat-notifications`;

@Injectable({
    providedIn: `root`
})
export class ChatNotificationService {
    public get allChatGroupsNotificationsObservable(): Observable<number> {
        return this._allGroupsNotificationsSubject;
    }

    private _allGroupsNotificationsSubject = new BehaviorSubject<number>(0);
    private _chatGroupNotificationEvents: NotificationAmountEvent = {};
    private _chatGroupLastSeenObject: LastSeenTimestampEvent = {};
    private _openChatGroupIds: Id[] = [];
    private _lastMessageAmount = 0;
    private _chatMessages: ViewChatMessage[] = [];

    public constructor(
        private storage: StorageService,
        private chatMessageRepo: ChatMessageControllerService,
        private notifyService: NotifyService,
        private operator: OperatorService
    ) {
        storage.addNoClearKey(STORAGE_KEY);
        this.setup();
    }

    public openChatGroup(chatGroupId: Id): void {
        this._openChatGroupIds.push(chatGroupId);

        // clear notification
        this._chatGroupLastSeenObject[chatGroupId] = new Date(); // set current date as new seen.

        this.save();

        // mute notifications locally
        this.getChatGroupNotificationSubject(chatGroupId).next(0);
        this.doAllChatGroupNotificationsUpdate();
    }

    public closeChatGroup(chatGroupId: Id): void {
        // clear notification
        this._chatGroupLastSeenObject[chatGroupId] = new Date(); // set current date as new seen.
        this.save();

        // unmute notifications locally
        this._openChatGroupIds = this._openChatGroupIds.filter(id => id !== chatGroupId);
    }

    public getChatGroupNotificationsEvent(chatGroupId: Id): Observable<number> {
        return this.getChatGroupNotificationSubject(chatGroupId);
    }

    private async setup(): Promise<void> {
        await this.loadFromStorage();
        this.chatMessageRepo.getViewModelListObservable().subscribe(messages => {
            if (messages && messages.length !== this._lastMessageAmount) {
                this._lastMessageAmount = messages.length;
                this._chatMessages = messages;
                this.doChatMessageUpdate();
            }
        });
        this.notifyService.getMessageObservable(STORAGE_KEY).subscribe(data => {
            if (data.sendByThisUser) {
                this.load(data.message);
            }
        });
    }

    private async save(): Promise<void> {
        await this.saveToStorage();
        await this.notifyService.sendToUsers(STORAGE_KEY, await this.storage.get(STORAGE_KEY), this.operator.user.id);
    }

    private async saveToStorage(): Promise<void> {
        const toSave = Object.entries(this._chatGroupLastSeenObject).mapToObject(([key, value]) => ({
            [key]: value.toISOString()
        }));
        await this.storage.set(STORAGE_KEY, toSave);
    }

    private async loadFromStorage(): Promise<void> {
        const lastTimestamps = await this.storage.get(STORAGE_KEY);
        this.load(lastTimestamps);
    }

    private load(lastTimestamps: any): void {
        if (isLastSeenTimestampEvent(lastTimestamps)) {
            Object.keys(lastTimestamps).forEach(id => {
                const date = new Date(lastTimestamps[+id]);
                if (!this._chatGroupLastSeenObject[+id] || date > this._chatGroupLastSeenObject[+id]) {
                    this._chatGroupLastSeenObject[+id] = date;
                }
            });
        }
        this.saveToStorage();
    }

    private getChatGroupNotificationSubject(chatGroupId: Id): BehaviorSubject<number> {
        if (!this._chatGroupNotificationEvents[chatGroupId]) {
            this._chatGroupNotificationEvents[chatGroupId] = new BehaviorSubject(0);
        }
        return this._chatGroupNotificationEvents[chatGroupId];
    }

    private doChatMessageUpdate(): void {
        const notificationsPerChatGroup: { [chatGroupId: number]: number } = {};
        for (const chatMessage of this._chatMessages) {
            const lastSeenTimestamp = this._chatGroupLastSeenObject[chatMessage.chat_group_id];
            if (
                !this._openChatGroupIds.includes(chatMessage.chat_group_id) &&
                (!lastSeenTimestamp || lastSeenTimestamp < chatMessage.getCreationDate())
            ) {
                const previousValue = notificationsPerChatGroup[chatMessage.chat_group_id] || 0;
                notificationsPerChatGroup[chatMessage.chat_group_id] = previousValue + 1;
            }
        }
        Object.keys(notificationsPerChatGroup).forEach(chatGroupIdString => {
            const chatGroupId = parseInt(chatGroupIdString, 10);
            this.getChatGroupNotificationSubject(chatGroupId).next(notificationsPerChatGroup[chatGroupId]);
        });
        this.doAllChatGroupNotificationsUpdate();
    }

    private doAllChatGroupNotificationsUpdate(): void {
        // This is a little bit ugly, but otherwise ExpressionChangedAfterItHasBeenCheckedErrors are thrown
        setTimeout(() =>
            this._allGroupsNotificationsSubject.next(
                Object.values(this._chatGroupNotificationEvents)
                    .map((subject: BehaviorSubject<number>) => subject.value)
                    .reduce((current, next) => current + next, 0)
            )
        );
    }
}
