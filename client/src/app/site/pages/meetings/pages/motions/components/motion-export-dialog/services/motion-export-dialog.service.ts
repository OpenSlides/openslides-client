import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { firstValueFrom } from 'rxjs';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { MotionExportInfo } from '../../../services/export/motion-export.service';
import { MotionExportService } from '../../../services/export/motion-export.service';
import { ViewMotion } from '../../../view-models';
import { MotionExportDialogComponent } from '../components/motion-export-dialog/motion-export-dialog.component';
import { MotionExportDialogModule } from '../motion-export-dialog.module';

@Injectable({
    providedIn: MotionExportDialogModule
})
export class MotionExportDialogService extends BaseDialogService<
    MotionExportDialogComponent,
    ViewMotion[],
    MotionExportInfo
> {
    public constructor(dialog: MatDialog, private exportService: MotionExportService) {
        super(dialog);
    }

    public async open(data: ViewMotion[]): Promise<MatDialogRef<MotionExportDialogComponent, MotionExportInfo>> {
        const module = await import(`../motion-export-dialog.module`).then(m => m.MotionExportDialogModule);
        return this.dialog.open(module.getComponent(), { data, ...largeDialogSettings });
    }

    public async export(motions: ViewMotion[]): Promise<void> {
        const dialogRef = await this.open(motions);
        const exportInfo = await firstValueFrom(dialogRef.afterClosed());
        if (exportInfo) {
            this.exportService.evaluateExportRequest(exportInfo, motions);
        }
    }
}
