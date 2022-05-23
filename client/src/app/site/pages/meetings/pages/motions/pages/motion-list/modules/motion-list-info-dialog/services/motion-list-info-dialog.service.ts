import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Identifiable } from 'src/app/domain/interfaces';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { MotionListInfoDialogComponent } from '../components/motion-list-info-dialog/motion-list-info-dialog.component';
import { MotionListInfoDialogConfig } from '../definitions';
import { MotionListInfoDialogModule } from '../motion-list-info-dialog.module';

@Injectable({
    providedIn: MotionListInfoDialogModule
})
export class MotionListInfoDialogService extends BaseDialogService<
    MotionListInfoDialogComponent,
    Partial<MotionListInfoDialogConfig>,
    Partial<MotionListInfoDialogConfig>
> {
    public async open(
        data: Partial<MotionListInfoDialogConfig> & Identifiable
    ): Promise<MatDialogRef<MotionListInfoDialogComponent, Partial<MotionListInfoDialogConfig>>> {
        const module = await import(`../motion-list-info-dialog.module`).then(m => m.MotionListInfoDialogModule);
        return this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
    }
}
