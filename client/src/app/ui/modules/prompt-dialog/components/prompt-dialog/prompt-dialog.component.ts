import { Component, Inject } from '@angular/core';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

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
