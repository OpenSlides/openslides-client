import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import { ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

@Component({
    selector: `os-speaker-user-select-dialog`,
    templateUrl: `./speaker-user-select-dialog.component.html`,
    styleUrls: [`./speaker-user-select-dialog.component.scss`]
})
export class SpeakerUserSelectDialogComponent {
    public editForm: UntypedFormGroup;

    public constructor(
        public readonly dialogRef: MatDialogRef<SpeakerUserSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public readonly listOfSpeakers: ViewListOfSpeakers,
        private fb: UntypedFormBuilder
    ) {
        this.editForm = this.fb.group({
            meeting_user_id: [``, []]
        });
    }

    public onOk(): void {
        if (!this.editForm.valid) {
            return;
        }
        const meeting_user_id = this.editForm.value.meeting_user;
        this.dialogRef.close({ meeting_user_id });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
