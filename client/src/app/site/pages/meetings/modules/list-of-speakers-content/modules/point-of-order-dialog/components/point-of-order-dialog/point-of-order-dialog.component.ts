import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

@Component({
    selector: `os-point-of-order-dialog`,
    templateUrl: `./point-of-order-dialog.component.html`,
    styleUrls: [`./point-of-order-dialog.component.scss`]
})
export class PointOfOrderDialogComponent {
    public editForm: FormGroup;

    public readonly MAX_LENGTH = 80;

    public constructor(
        public readonly dialogRef: MatDialogRef<PointOfOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly listOfSpeakers: ViewListOfSpeakers,
        private fb: FormBuilder
    ) {
        this.editForm = this.fb.group({
            note: [``, [Validators.required, Validators.maxLength(this.MAX_LENGTH)]]
        });
    }

    public onOk(): void {
        if (!this.editForm.valid) {
            return;
        }
        const note = this.editForm.value.note;
        this.dialogRef.close({ note });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
