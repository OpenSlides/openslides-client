import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditorHtmlDialogOutput {
    action: `cancel` | `set`;
    html?: string;
}

@Component({
    selector: `os-editor-html-dialog`,
    templateUrl: `./editor-html-dialog.component.html`
})
export class EditorHtmlDialogComponent {
    public isUpdate: boolean;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: string,
        private dialogRef: MatDialogRef<EditorHtmlDialogComponent>
    ) {
        this.data = this.formatHtml(this.data);
    }

    // https://stackoverflow.com/a/60338028
    public formatHtml(html: string) {
        const tab = `\t`;
        let result = ``;
        let indent = ``;

        html.split(/>\s*</).forEach(function (element) {
            if (element.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }

            result += indent + `<` + element + `>\r\n`;

            if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith(`input`)) {
                indent += tab;
            }
        });

        return result.substring(1, result.length - 3);
    }

    public cancel() {
        this.dialogRef.close({ action: `cancel` });
    }

    public save() {
        this.dialogRef.close({ action: `set`, html: this.data });
    }
}
