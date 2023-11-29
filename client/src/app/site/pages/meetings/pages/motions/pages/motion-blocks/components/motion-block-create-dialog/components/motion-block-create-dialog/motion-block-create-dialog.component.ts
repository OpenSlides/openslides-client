import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';

@Component({
    selector: `os-motion-block-create-dialog`,
    templateUrl: `./motion-block-create-dialog.component.html`,
    styleUrls: [`./motion-block-create-dialog.component.scss`]
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

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.saveBlock();
        }
        if (event.key === `Escape`) {
            this.dialogRef.close();
        }
    }

    public saveBlock(): void {
        this.dialogRef.close(this.createBlockForm.value);
    }
}
