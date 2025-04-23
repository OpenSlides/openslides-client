import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewMotion } from '../../../../../../view-models';

interface MotionDeleteDialogData {
    motion: ViewMotion;
}

@Component({
    selector: `os-motion-delete-dialog`,
    templateUrl: `./motion-delete-dialog.component.html`,
    styleUrls: [`./motion-delete-dialog.component.scss`],
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe]
})
export class MotionDeleteDialogComponent {
    public get deletedAmendments(): string {
        return this.data.motion.amendments
            .map(amendment => (amendment.number ? amendment.number : amendment.title))
            .join(`, `);
    }

    public constructor(
        public dialogRef: MatDialogRef<MotionDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MotionDeleteDialogData
    ) {}
}
