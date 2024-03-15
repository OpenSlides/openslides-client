import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { CHAT_MESSAGE_MAX_LENGTH } from 'src/app/gateways/repositories/chat/chat-message-repository.service';
import { KeyCode } from 'src/app/infrastructure/utils/key-code';
import { ViewChatMessage } from 'src/app/site/pages/meetings/pages/chat';

@Component({
    selector: `os-chat-group-detail-message-form`,
    templateUrl: `./chat-group-detail-message-form.component.html`,
    styleUrls: [`./chat-group-detail-message-form.component.scss`]
})
export class ChatGroupDetailMessageFormComponent {
    public readonly CHAT_MESSAGE_MAX_LENGTH = CHAT_MESSAGE_MAX_LENGTH;

    @Input()
    public set currentMessage(message: ViewChatMessage | null) {
        this._currentMessage = message;
        this.messageForm.setValue(message?.content || ``);
    }

    public get currentMessage(): ViewChatMessage | null {
        return this._currentMessage;
    }

    @Output()
    public messageSent = new EventEmitter<string>();

    @Output()
    public editingCanceled = new EventEmitter<void>();

    public get isMessageFormValid(): boolean {
        return !!this.messageForm.value?.trim()?.length && this.messageForm.valid;
    }

    public readonly messageForm: UntypedFormControl;

    private _currentMessage: ViewChatMessage | null = null;

    public constructor(fb: UntypedFormBuilder) {
        this.messageForm = fb.control(``, [Validators.maxLength(CHAT_MESSAGE_MAX_LENGTH)]);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyCode.ENTER) {
            this.sendChatMessage();
        }
    }

    public sendChatMessage(): void {
        const content = this.messageForm.value?.trim() as string;
        this.messageSent.emit(content);
        this.resetMessageForm();
    }

    public cancelEditingChatMessage(): void {
        this.editingCanceled.emit();
        this.resetMessageForm();
    }

    private resetMessageForm(): void {
        this.currentMessage = null;
        this.messageForm.markAsPristine();
    }
}
