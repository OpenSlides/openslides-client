import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { isUniqueAmong } from 'src/app/infrastructure/utils/validators/is-unique-among';

@Component({
    selector: `os-meeting-clone-dialog`,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        TranslatePipe
    ],
    templateUrl: `./meeting-clone-dialog.component.html`,
    styleUrl: `./meeting-clone-dialog.component.scss`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingCloneDialogComponent {
    public form: FormGroup;

    public constructor(
        public dialogRef: MatDialogRef<MeetingCloneDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            external_id: [``, isUniqueAmong<string>(data.existingExternalIds, (a, b) => a === b, [null, ``])]
        });
    }

    public onCancel(): void {
        this.dialogRef.close(null);
    }

    public onClone(): void {
        this.dialogRef.close(this.form.value);
    }
}
