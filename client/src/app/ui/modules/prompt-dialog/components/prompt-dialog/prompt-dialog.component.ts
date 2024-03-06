import { Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog';

interface PromptDialogData {
    title: string;
    content: string;
}

@Component({
    selector: `os-prompt-dialog`,
    templateUrl: `./prompt-dialog.component.html`,
    styleUrls: [`./prompt-dialog.component.scss`]
})
export class PromptDialogComponent {
    public constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
    ) {}
}
