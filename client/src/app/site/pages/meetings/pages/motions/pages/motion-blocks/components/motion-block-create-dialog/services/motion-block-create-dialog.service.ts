import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { MotionBlockCreateDialogComponent } from '../components/motion-block-create-dialog/motion-block-create-dialog.component';
import { MotionBlockCreateDialogModule } from '../motion-block-create-dialog.module';

@Injectable({
    providedIn: MotionBlockCreateDialogModule
})
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
