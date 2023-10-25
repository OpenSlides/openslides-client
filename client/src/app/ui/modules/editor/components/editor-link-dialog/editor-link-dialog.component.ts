import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: `os-editor-link-dialog`,
    templateUrl: `./editor-link-dialog.component.html`
})
export class EditorLinkDialogComponent {
    public initialValue: unknown;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { href: string; target?: string }) {
        this.initialValue = structuredClone(data);
        if (!data) {
            data = { href: `` };
        }
    }
}
