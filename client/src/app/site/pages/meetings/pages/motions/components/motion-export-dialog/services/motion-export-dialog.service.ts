import { Injectable } from '@angular/core';
import { MotionExportDialogModule } from '../motion-export-dialog.module';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';
import { MotionExportDialogComponent } from '../components/motion-export-dialog/motion-export-dialog.component';
import { MotionExportInfo } from '../../../services/export/motion-export.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ViewMotion } from '../../../view-models';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { firstValueFrom } from 'rxjs';
import { MotionExportService } from '../../../services/export/motion-export.service';

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
