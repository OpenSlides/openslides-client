import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface EditorLinkDialogInput {
    link?: { href: string; target?: string };
    needsText?: boolean;
}

export interface EditorLinkDialogOutput {
    action: `remove-link` | `cancel` | `set-link`;
    link?: { href: string; target?: string };
    text?: string;
}

@Component({
    selector: `os-editor-link-dialog`,
    templateUrl: `./editor-link-dialog.component.html`,
    styleUrls: [`editor-link-dialog.component.scss`]
})
export class EditorLinkDialogComponent {
    public isUpdate: boolean;

    public link: { href: string; target?: string };

    public text = ``;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditorLinkDialogInput,
        private dialogRef: MatDialogRef<EditorLinkDialogComponent>
    ) {
        this.link = data.link;
        this.isUpdate = !!data.link && !!data.link.href;
        if (!this.link.target) {
            this.link.target = `_self`;
        }
    }

    public removeLink(): void {
        this.dialogRef.close({ action: `remove-link` });
    }

    public cancel(): void {
        this.dialogRef.close({ action: `cancel` });
    }

    public save(): void {
        if (this.link.href && !/^[a-zA-Z]+:\/\//.test(this.link.href)) {
            this.link.href = `http://` + this.link.href;
        }

        if (this.data.needsText) {
            this.dialogRef.close({ action: `set-link`, link: this.link, text: this.text || this.link });
        } else {
            this.dialogRef.close({ action: `set-link`, link: this.link });
        }
    }
}
