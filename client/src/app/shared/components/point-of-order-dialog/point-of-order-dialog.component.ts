import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';

@Component({
    selector: `os-point-of-order-dialog`,
    templateUrl: `./point-of-order-dialog.component.html`,
    styleUrls: [`./point-of-order-dialog.component.scss`]
})
export class PointOfOrderDialogComponent {
    public editForm: FormGroup;

    public readonly MAX_LENGTH = 80;

    public constructor(
        public dialogRef: MatDialogRef<PointOfOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public listOfSpeakers: ViewListOfSpeakers,
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
