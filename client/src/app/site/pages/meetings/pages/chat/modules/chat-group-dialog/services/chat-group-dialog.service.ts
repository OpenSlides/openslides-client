import { Injectable } from '@angular/core';
import { Ids } from 'src/app/domain/definitions/key-types';
import { ChatGroupDialogModule } from '../chat-group-dialog.module';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';
import { ChatGroupDialogComponent } from '../components/chat-group-dialog/chat-group-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';

export interface ChatGroupDialogData {
    name: string;
    read_group_ids: number[];
    write_group_ids: number[];
}

interface ChatGroupDialogResult {
    name: string;
    read_group_ids: Ids;
    write_group_ids: Ids;
}

@Injectable({
    providedIn: ChatGroupDialogModule
})
export class ChatGroupDialogService extends BaseDialogService<
    ChatGroupDialogComponent,
    ChatGroupDialogData,
    ChatGroupDialogResult
> {
    public async open(
        data?: ChatGroupDialogData
    ): Promise<MatDialogRef<ChatGroupDialogComponent, ChatGroupDialogResult>> {
        const module = await import(`../chat-group-dialog.module`).then(m => m.ChatGroupDialogModule);
        return this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
    }
}
