import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: `os-vote-token-dialog`,
    templateUrl: `./vote-token-dialog.component.html`,
    styleUrls: [`./vote-token-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoteTokenDialogComponent {
    public token: string;

    constructor(@Inject(MAT_DIALOG_DATA) data: string) {
        this.token = data;
    }
}
