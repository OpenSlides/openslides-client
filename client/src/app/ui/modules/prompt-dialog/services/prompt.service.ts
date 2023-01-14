import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { firstValueFrom } from 'rxjs';

import { PromptDialogComponent } from '../components/prompt-dialog/prompt-dialog.component';
import { PromptDialogModule } from '../prompt-dialog.module';

@Injectable({
    providedIn: PromptDialogModule
})
export class PromptService {
    private dialogRef: MatDialogRef<PromptDialogComponent> | null = null;

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
        return firstValueFrom(this.dialogRef.afterClosed());
    }

    public close(): void {
        this.dialogRef!.close();
    }
}
