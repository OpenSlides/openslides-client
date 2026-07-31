import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { TranslatePipe } from '@ngx-translate/core';

export interface DialogData {
    poll: ViewPoll;
}

@Component({
    selector: 'os-poll-stop-dialog',
    templateUrl: './poll-stop-dialog.component.html',
    styleUrl: './poll-stop-dialog.component.scss',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        TranslatePipe
    ]
})
export class PollStopDialog {
    private readonly dialogRef = inject(MatDialogRef<PollStopDialog>);
    private readonly data = inject<DialogData>(MAT_DIALOG_DATA);

    public get poll(): ViewPoll {
        return this.data.poll;
    }

    public onNoClick(): void {
        this.dialogRef.close();
    }
}
