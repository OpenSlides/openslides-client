import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ProjectorMessageDialogComponent } from '../components/projector-message-dialog/projector-message-dialog.component';
import { MessageDialogData } from '../definitions';

@Injectable({
    providedIn: `root`
})
export class ProjectorMessageDialogService extends BaseDialogService<
    ProjectorMessageDialogComponent,
    Partial<MessageDialogData>,
    Partial<MessageDialogData>
> {
    public async open({ message = `` }: Partial<MessageDialogData> = {}): Promise<
        MatDialogRef<ProjectorMessageDialogComponent, Partial<MessageDialogData>>
    > {
        const module = await import(`../projector-message-dialog.module`).then(m => m.ProjectorMessageDialogModule);
        return this.dialog.open(module.getComponent(), { data: { message }, ...largeDialogSettings });
    }
}
