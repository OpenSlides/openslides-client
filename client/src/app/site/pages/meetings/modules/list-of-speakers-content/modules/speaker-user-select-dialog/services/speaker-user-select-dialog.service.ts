import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Id } from 'src/app/domain/definitions/key-types';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { SpeakerUserSelectDialogComponent } from '../components/speaker-user-select-dialog/speaker-user-select-dialog.component';
import { SpeakerUserSelectDialogModule } from '../speaker-user-select-dialog.module';

interface SpeakerUserSelectResult {
    meeting_user_id: Id;
}

@Injectable({
    providedIn: SpeakerUserSelectDialogModule
})
export class SpeakerUserSelectDialogService extends BaseDialogService<
    SpeakerUserSelectDialogComponent,
    ViewListOfSpeakers,
    SpeakerUserSelectResult
> {
    public async open(
        los: ViewListOfSpeakers
    ): Promise<MatDialogRef<SpeakerUserSelectDialogComponent, SpeakerUserSelectResult>> {
        const module = await import(`../speaker-user-select-dialog.module`).then(m => m.SpeakerUserSelectDialogModule);
        return this.dialog.open(module.getComponent(), {
            data: { listOfSpeakers: los },
            ...infoDialogSettings,
            disableClose: false
        });
    }
}
