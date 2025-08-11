import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

export interface AccountMergeDialogData {
    choices: ViewUser[];
}
export type AccountMergeDialogAnswer = number | null;

@Component({
    selector: `os-account-merge-dialog`,
    templateUrl: `./account-merge-dialog.component.html`,
    styleUrls: [`./account-merge-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AccountMergeDialogComponent {
    public constructor(
        public dialogRef: MatDialogRef<AccountMergeDialogComponent, AccountMergeDialogAnswer>,
        @Inject(MAT_DIALOG_DATA) public data: AccountMergeDialogData
    ) {
        this.data.choices.sort((a, b) => a.name.localeCompare(b.name));
        const meetingIdsVisited: number[] = [];

        for (const user of this.data.choices) {
            for (const meeting of user.meetings) {
                if (meetingIdsVisited.includes(meeting.id)) {
                    this._meetingsCollide.add(meeting.id);
                }
                meetingIdsVisited.push(meeting.id);
            }
        }
    }

    public selectedUserId: number;
    public displayedColumns = [`button`, `name`, `icon`];
    private _meetingsCollide = new Set<number>();

    public get showMeetingsCollide(): boolean {
        return this._meetingsCollide.size > 0;
    }

    public get countMeetingsCollide(): number {
        return this._meetingsCollide.size;
    }

    public get possibleChoices(): ViewUser[] {
        return this.data.choices;
    }

    public userMeetings(user: ViewUser): string {
        if (user.meetings.length > 10) {
            const res = user.meetings.map(a => a.name).slice(0, 10);
            res.push(`...`);
            return res.join(`\n`);
        } else {
            return user.meetings.map(a => a.name).join(`\n`);
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
