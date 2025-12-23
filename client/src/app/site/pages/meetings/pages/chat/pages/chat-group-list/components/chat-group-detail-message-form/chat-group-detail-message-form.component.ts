import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CHAT_MESSAGE_MAX_LENGTH } from 'src/app/gateways/repositories/chat/chat-message-repository.service';
import { KeyCode } from 'src/app/infrastructure/utils/key-code';
import { ViewChatMessage } from 'src/app/site/pages/meetings/pages/chat';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-chat-group-detail-message-form`,
    templateUrl: `./chat-group-detail-message-form.component.html`,
    styleUrls: [`./chat-group-detail-message-form.component.scss`],
    standalone: false
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

    public constructor(
        fb: UntypedFormBuilder,
        private operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        protected translate: TranslateService,
        private snackBar: MatSnackBar
    ) {
        this.messageForm = fb.control(``, [Validators.maxLength(CHAT_MESSAGE_MAX_LENGTH)]);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyCode.ENTER && !event.shiftKey) {
            this.sendChatMessage();
            event.preventDefault();
        }
    }

    public sendChatMessage(): void {
        if (!this.isPartOfMetting()) {
            const infoMessage = this.translate.instant(`Action not possible. You have to be part of the meeting.`);
            this.snackBar.open(infoMessage, this.translate.instant(`Ok`));
        } else {
            const content = this.messageForm.value?.trim() as string;
            this.messageSent.emit(content);
            this.resetMessageForm();
        }
    }

    public cancelEditingChatMessage(): void {
        this.editingCanceled.emit();
        this.resetMessageForm();
    }

    private resetMessageForm(): void {
        this.currentMessage = null;
        this.messageForm.markAsPristine();
    }

    public isPartOfMetting(): boolean {
        return this.operator.isInMeeting(this.activeMeetingIdService.meetingId);
    }
}
