import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MotionBlock } from '@app/domain/models/motions/motion-block';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { MotionBlockEditDialogComponent } from '../components/motion-block-edit-dialog/motion-block-edit-dialog.component';

@Service()
export class MotionBlockEditDialogService extends BaseDialogService<
    MotionBlockEditDialogComponent,
    MotionBlock,
    Partial<MotionBlock>
> {
    public async open(data: MotionBlock): Promise<MatDialogRef<MotionBlockEditDialogComponent, MotionBlock>> {
        const module = await import(`../motion-block-edit-dialog.module`).then(m => m.MotionBlockEditDialogModule);
        return this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
    }
}
