import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { PromptDialogComponent } from '../prompt-dialog.component';

@Injectable({
    providedIn: PromptDialogComponent
})
export class PromptService {
    private dialogRef: MatDialogRef<PromptDialogComponent> | null = null;

    public constructor(
        private dialog: MatDialog,
        private translate: TranslateService
    ) {}

    /**
     * Opens the dialog. Returns true, if the user accepts.
     * @param title The title to display in the dialog
     * @param content The content in the dialog
     */
    public async open(
        title: string,
        content = ``,
        confirm?: string,
        decline?: string,
        deletion?: boolean
    ): Promise<any> {
        this.dialogRef = this.dialog.open(PromptDialogComponent, {
            width: `290px`,
            data: { title, content, confirm, decline, deletion }
        });
        return firstValueFrom(this.dialogRef.afterClosed());
    }

    /**
     * Opens the dialog with html content. Returns true, if the user accepts.
     * @param title The title to display in the dialog
     * @param content The content in the dialog
     */
    public async openSafe(
        title: string,
        content = ``,
        confirm?: string,
        decline?: string,
        deletion?: boolean
    ): Promise<any> {
        this.dialogRef = this.dialog.open(PromptDialogComponent, {
            width: `290px`,
            data: { title, contentHtml: content, confirm, decline, deletion }
        });
        return firstValueFrom(this.dialogRef.afterClosed());
    }

    public close(): void {
        this.dialogRef!.close();
    }

    /**
     * Shorthand to ask the user for confirmation on discarding all changes.
     */
    public async discardChangesConfirmation(): Promise<boolean> {
        const title = this.translate.instant(`Do you really want to discard all your changes?`);
        const content = this.translate.instant(`Unsaved changes will not be applied.`);
        return this.open(title, content);
    }
}
