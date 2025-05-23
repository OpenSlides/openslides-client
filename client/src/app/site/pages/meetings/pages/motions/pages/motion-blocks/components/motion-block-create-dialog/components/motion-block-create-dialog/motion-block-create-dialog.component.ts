import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';

@Component({
    selector: `os-motion-block-create-dialog`,
    templateUrl: `./motion-block-create-dialog.component.html`,
    styleUrls: [`./motion-block-create-dialog.component.scss`],
    standalone: false
})
export class MotionBlockCreateDialogComponent {
    public readonly createBlockForm: UntypedFormGroup;

    public constructor(
        private dialogRef: MatDialogRef<MotionBlockCreateDialogComponent, Partial<MotionBlock>>,
        formBuilder: UntypedFormBuilder
    ) {
        this.createBlockForm = formBuilder.group({
            title: [``, Validators.required],
            agenda_create: [``],
            agenda_parent_id: [],
            agenda_type: [``],
            internal: [false]
        });
    }

    public saveBlock(): void {
        this.dialogRef.close(this.createBlockForm.value);
    }
}
