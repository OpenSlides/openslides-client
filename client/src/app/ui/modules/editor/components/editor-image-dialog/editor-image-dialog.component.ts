import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface EditorImageData {
    src: string;
    alt: string;
    title: string;
}

interface EditorImageDialogInput {
    image?: EditorImageData;
}

export interface EditorImageDialogOutput {
    action: `cancel` | `set-image`;
    image?: EditorImageData;
}

@Component({
    selector: `os-editor-image-dialog`,
    templateUrl: `./editor-image-dialog.component.html`
})
export class EditorImageDialogComponent {
    public image: EditorImageData;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorImageDialogInput,
        private dialogRef: MatDialogRef<EditorImageDialogComponent>
    ) {
        this.image = data.image;
    }

    public cancel() {
        this.dialogRef.close({ action: `cancel` });
    }

    public save() {
        this.dialogRef.close({ action: `set-image`, image: this.image });
    }
}
