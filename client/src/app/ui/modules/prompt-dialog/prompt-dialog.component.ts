import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

interface PromptDialogData {
    title: string;
    content?: string;
    contentHtml?: string;
    confirm?: string;
    decline?: string;
    deletion?: boolean;
}

@Component({
    selector: `os-prompt-dialog`,
    templateUrl: `./prompt-dialog.component.html`,
    styleUrls: [`./prompt-dialog.component.scss`],
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe]
})
export class PromptDialogComponent {
    public constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
    ) {}
}
