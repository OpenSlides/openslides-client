import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';

@Component({
    selector: `os-motion-block-edit-dialog`,
    templateUrl: `./motion-block-edit-dialog.component.html`,
    styleUrls: [`./motion-block-edit-dialog.component.scss`]
})
export class MotionBlockEditDialogComponent {
    public readonly blockEditForm: UntypedFormGroup;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public readonly block: Partial<MotionBlock>,
        private dialogRef: MatDialogRef<MotionBlockEditDialogComponent, Partial<MotionBlock>>,
        formBuilder: UntypedFormBuilder
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
