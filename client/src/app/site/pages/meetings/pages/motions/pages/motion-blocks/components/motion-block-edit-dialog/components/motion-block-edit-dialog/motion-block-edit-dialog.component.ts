import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'os-motion-block-edit-dialog',
    templateUrl: './motion-block-edit-dialog.component.html',
    styleUrls: ['./motion-block-edit-dialog.component.scss']
})
export class MotionBlockEditDialogComponent {
    public readonly blockEditForm: FormGroup;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public readonly block: Partial<MotionBlock>,
        private dialogRef: MatDialogRef<MotionBlockEditDialogComponent, Partial<MotionBlock>>,
        formBuilder: FormBuilder
    ) {
        this.blockEditForm = formBuilder.group({
            title: [this.block.title, Validators.required],
            internal: [this.block.internal]
        });
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Escape`) {
            this.dialogRef.close();
        }
    }

    public saveBlock(): void {
        this.dialogRef.close(this.blockEditForm.value);
    }
}
