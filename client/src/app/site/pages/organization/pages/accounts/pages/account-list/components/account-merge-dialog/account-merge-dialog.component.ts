import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

export type AccountMergeDialogData = { choices: ViewUser[] };
export type AccountMergeDialogAnswer = number | null;

@Component({
    selector: `os-account-merge-dialog`,
    templateUrl: `./account-merge-dialog.component.html`,
    styleUrls: [`./account-merge-dialog.component.scss`]
})
export class AccountMergeDialogComponent {
    public constructor(
        public dialogRef: MatDialogRef<AccountMergeDialogComponent, AccountMergeDialogAnswer>,
        @Inject(MAT_DIALOG_DATA) public data: AccountMergeDialogData
    ) {
        this.data.choices.sort((a, b) => a.name.localeCompare(b.name));
    }

    public selectedUserId: number;

    public get possibleChoices(): ViewUser[] {
        return this.data.choices;
    }

    public userMeetings(user: ViewUser): string {
        if (user.meetings.length > 10) {
            const res = user.meetings.map(a => a.name).slice(0, 10);
            res.push(`...`);
            return res.join(`, `);
        } else {
            return user.meetings.map(a => a.name).join(`, `);
        }
    }

    public isCrossedOut(user: ViewUser): boolean {
        if (!this.selectedUserId) {
            return false;
        }
        return this.selectedUserId !== user.id;
    }

    public onChange(event): void {
        this.selectedUserId = Number.parseInt(event.value);
    }

    protected closeDialog(ok: boolean): void {
        if (ok && this.selectedUserId) {
            this.dialogRef.close(this.selectedUserId);
        } else {
            this.dialogRef.close(null);
        }
    }
}
