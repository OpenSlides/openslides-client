import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

interface ParticipantSwitchDialogConfig {
    leftUser: ViewUser;
    rightUser: ViewUser;
}

@Component({
    selector: `os-participant-switch-dialog`,
    templateUrl: `./participant-switch-dialog.component.html`,
    styleUrls: [`./participant-switch-dialog.component.scss`]
})
export class ParticipantSwitchDialogComponent {
    public get users(): ViewUser[] {
        return [this.data.leftUser, this.data.rightUser];
    }

    public constructor(@Inject(MAT_DIALOG_DATA) private data: ParticipantSwitchDialogConfig) {}
}
