import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PromptDialogComponent } from '../../shared/components/prompt-dialog/prompt-dialog.component';

/**
 * A general service for prompting 'yes' or 'cancel' thinks from the user.
 */
@Injectable({
    providedIn: `root`
})
export class PromptService {
    private dialogRef: MatDialogRef<PromptDialogComponent>;

    public constructor(private dialog: MatDialog) {}

    /**
     * Opens the dialog. Returns true, if the user accepts.
     * @param title The title to display in the dialog
     * @param content The content in the dialog
     */
    public async open(title: string, content: string = ``): Promise<any> {
        this.dialogRef = this.dialog.open(PromptDialogComponent, {
            width: `290px`,
            data: { title, content }
        });

        return this.dialogRef.afterClosed().toPromise();
    }

    public close(): void {
        this.dialogRef.close();
    }
}
