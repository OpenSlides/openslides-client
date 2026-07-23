import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Id } from '@app/domain/definitions/key-types';
import { SpeechState } from '@app/domain/models/speakers/speech-state';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ViewListOfSpeakers } from '@app/site/pages/meetings/pages/agenda';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { SpeakerUserSelectDialogComponent } from '../components/speaker-user-select-dialog/speaker-user-select-dialog.component';

interface SpeakerUserSelectResult {
    meeting_user_id: Id;
    structure_level_id?: Id;
}

@Service()
export class SpeakerUserSelectDialogService extends BaseDialogService<
    SpeakerUserSelectDialogComponent,
    ViewListOfSpeakers,
    SpeakerUserSelectResult
> {
    public async open(
        los: ViewListOfSpeakers,
        speech_state?: SpeechState,
        answer?: boolean
    ): Promise<MatDialogRef<SpeakerUserSelectDialogComponent, SpeakerUserSelectResult>> {
        const module = await import(`../speaker-user-select-dialog.module`).then(m => m.SpeakerUserSelectDialogModule);
        return this.dialog.open(module.getComponent(), {
            data: { listOfSpeakers: los, state: speech_state, answer },
            ...infoDialogSettings,
            disableClose: false
        });
    }
}
