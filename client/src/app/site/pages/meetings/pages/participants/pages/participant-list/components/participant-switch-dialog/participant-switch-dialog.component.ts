import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { UserSelectionData } from 'src/app/site/pages/meetings/modules/participant-search-selector';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

interface ParticipantSwitchDialogConfig {
    leftUser: ViewUser;
    rightUser?: ViewUser;
}

@Component({
    selector: `os-participant-switch-dialog`,
    templateUrl: `./participant-switch-dialog.component.html`,
    styleUrls: [`./participant-switch-dialog.component.scss`]
})
export class ParticipantSwitchDialogComponent {
    public left: ViewUser;
    public right: ViewUser;

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: ParticipantSwitchDialogConfig,
        private userRepo: UserRepositoryService
    ) {
        this.left = data.leftUser;
        this.right = data.rightUser;
    }

    public onUserSelect(data: UserSelectionData): void {
        const user = this.userRepo.getViewModel(data.userId);
        if (user) {
            this.right = user;
        }
    }
}
