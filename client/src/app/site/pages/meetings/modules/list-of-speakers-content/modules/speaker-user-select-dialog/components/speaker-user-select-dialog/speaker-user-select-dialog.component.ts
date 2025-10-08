import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Id } from 'src/app/domain/definitions/key-types';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { getSpeakerVerboseState, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

import { UserSelectionData } from '../../../../../participant-search-selector';

interface SpeakerUserSelectDialogComponentData {
    listOfSpeakers: ViewListOfSpeakers;
    state?: SpeechState;
    answer: boolean;
}

@Component({
    selector: `os-speaker-user-select-dialog`,
    templateUrl: `./speaker-user-select-dialog.component.html`,
    styleUrls: [`./speaker-user-select-dialog.component.scss`],
    standalone: false
})
export class SpeakerUserSelectDialogComponent {
    public nonAvailableUserIds: Id[] = [];

    public get verboseState(): string {
        return getSpeakerVerboseState({ speech_state: this.data.state, answer: this.data.answer });
    }

    public constructor(
        public readonly dialogRef: MatDialogRef<SpeakerUserSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public readonly data: SpeakerUserSelectDialogComponentData,
        public userRepo: UserRepositoryService
    ) {}

    public setCurrentUser(selection: UserSelectionData): void {
        if (selection.userId) {
            const meeting_user = this.userRepo
                .getViewModel(selection.userId)
                .getMeetingUser(this.data.listOfSpeakers.meeting_id);

            let structure_level_id = undefined;
            if (meeting_user.structure_levels.length === 1) {
                structure_level_id = meeting_user.structure_levels[0].id;
            }

            this.dialogRef.close({ meeting_user_id: meeting_user.id, structure_level_id });
        }
    }

    public onCancel(): void {
        this.dialogRef.close();
    }

    public onContinue(): void {
        this.dialogRef.close({ meeting_user_id: null });
    }
}
