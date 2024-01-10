import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { SpeakerUserSelectDialogComponent } from '../components/speaker-user-select-dialog/speaker-user-select-dialog.component';
import { SpeakerUserSelectDialogModule } from '../speaker-user-select-dialog.module';

interface PointOfOrderResult {
    note: string;
    point_of_order_category_id: number;
}

@Injectable({
    providedIn: SpeakerUserSelectDialogModule
})
export class SpeakerUserSelectDialogService extends BaseDialogService<
    SpeakerUserSelectDialogComponent,
    ViewListOfSpeakers,
    PointOfOrderResult
> {
    public async open(
        data: ViewListOfSpeakers
    ): Promise<MatDialogRef<SpeakerUserSelectDialogComponent, PointOfOrderResult>> {
        const module = await import(`../speaker-user-select-dialog.module`).then(m => m.SpeakerUserSelectDialogModule);
        return this.dialog.open(module.getComponent(), {
            data,
            ...infoDialogSettings,
            disableClose: false
        });
    }
}
