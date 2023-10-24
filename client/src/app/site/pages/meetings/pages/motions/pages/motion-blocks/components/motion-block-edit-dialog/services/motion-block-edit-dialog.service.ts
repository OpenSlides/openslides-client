import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { MotionBlockEditDialogComponent } from '../components/motion-block-edit-dialog/motion-block-edit-dialog.component';
import { MotionBlockEditDialogModule } from '../motion-block-edit-dialog.module';

@Injectable({
    providedIn: MotionBlockEditDialogModule
})
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
