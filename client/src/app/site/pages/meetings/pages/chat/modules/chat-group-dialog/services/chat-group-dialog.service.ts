import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Ids } from '@app/domain/definitions/key-types';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { ChatGroupDialogComponent } from '../components/chat-group-dialog/chat-group-dialog.component';

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

@Service()
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
