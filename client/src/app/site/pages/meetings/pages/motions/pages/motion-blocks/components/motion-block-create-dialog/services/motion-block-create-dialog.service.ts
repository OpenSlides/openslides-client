import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MotionBlock } from '@app/domain/models/motions/motion-block';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { MotionBlockCreateDialogComponent } from '../components/motion-block-create-dialog/motion-block-create-dialog.component';

@Service()
export class MotionBlockCreateDialogService extends BaseDialogService<
    MotionBlockCreateDialogComponent,
    null,
    MotionBlock
> {
    public async open(): Promise<MatDialogRef<MotionBlockCreateDialogComponent, MotionBlock>> {
        const module = await import(`../motion-block-create-dialog.module`).then(m => m.MotionBlockCreateDialogModule);
        return this.dialog.open(module.getComponent(), infoDialogSettings);
    }
}
