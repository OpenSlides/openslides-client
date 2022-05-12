import { Injectable } from '@angular/core';
import { MotionForwardDialogModule } from '../motion-forward-dialog.module';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';
import { MotionForwardDialogComponent } from '../components/motion-forward-dialog/motion-forward-dialog.component';
import { ViewMotion } from '../../../view-models';
import { Ids } from 'src/app/domain/definitions/key-types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { firstValueFrom } from 'rxjs';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { TranslateService } from '@ngx-translate/core';
import { MotionFormatService } from '../../../services/common/motion-format.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: MotionForwardDialogModule
})
export class MotionForwardDialogService extends BaseDialogService<MotionForwardDialogComponent, ViewMotion[], Ids> {
    public constructor(
        dialog: MatDialog,
        private translate: TranslateService,
        private repo: MotionRepositoryService,
        private formatService: MotionFormatService,
        private snackbar: MatSnackBar
    ) {
        super(dialog);
    }

    public async open(data: ViewMotion[]): Promise<MatDialogRef<MotionForwardDialogComponent, Ids>> {
        const module = await import(`../motion-forward-dialog.module`).then(m => m.MotionForwardDialogModule);
        return this.dialog.open(module.getComponent(), { ...mediumDialogSettings, data });
    }

    public async forwardMotionsToMeetings(...motions: ViewMotion[]): Promise<void> {
        const toForward = motions.filter(motion => motion.state?.allow_motion_forwarding);
        const dialogRef = await this.open(toForward);
        const toMeetingIds = (await firstValueFrom(dialogRef.afterClosed())) as Ids;
        if (toMeetingIds) {
            try {
                const forwardMotions = toForward.map(motion => this.formatService.formatMotionForForward(motion));
                await this.repo.createForwarded(toMeetingIds, ...forwardMotions);
                this.snackbar.open(this.createForwardingSuccessMessage(toForward.length, motions.length), `Ok`);
            } catch (e: any) {
                this.snackbar.open(e.toString(), `Ok`);
            }
        }
    }

    private createForwardingSuccessMessage(toForwardLength: number, selectedMotionsLength: number): string {
        const ofTranslated = _(`of`);
        const successfulMessage = _(`successfully forwarded`);
        const verboseName = _(this.repo.getVerboseName(selectedMotionsLength !== 1));
        const additionalInfo = selectedMotionsLength !== 1 ? `${ofTranslated} ${selectedMotionsLength} ` : ``;

        return `${toForwardLength} ${additionalInfo}${verboseName} ${successfulMessage}`;
    }
}
