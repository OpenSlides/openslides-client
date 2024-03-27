import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface EditorEmbedData {
    src: string;
    title: string;
}

interface EditorEmbedDialogInput {
    embed?: EditorEmbedData;
}

export interface EditorEmbedDialogOutput {
    action: `cancel` | `set-embed`;
    embed?: EditorEmbedData;
}

@Component({
    selector: `os-editor-image-dialog`,
    templateUrl: `./editor-embed-dialog.component.html`
})
export class EditorEmbedDialogComponent {
    public embed: EditorEmbedData;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorEmbedDialogInput,
        private dialogRef: MatDialogRef<EditorEmbedDialogComponent>
    ) {
        this.embed = data.embed;
    }

    public cancel() {
        this.dialogRef.close({ action: `cancel` });
    }

    public save() {
        this.dialogRef.close({ action: `set-embed`, embed: this.embed });
    }
}
