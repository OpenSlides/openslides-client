import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfoDialog } from '../../services/participant-list-info-dialog.service';
import { GENDERS } from 'src/app/domain/models/users/user';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { Observable, map } from 'rxjs';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { UserService } from 'src/app/site/services/user.service';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';

@Component({
    selector: 'os-participant-list-info-dialog',
    templateUrl: './participant-list-info-dialog.component.html',
    styleUrls: ['./participant-list-info-dialog.component.scss']
})
export class ParticipantListInfoDialogComponent implements OnInit {
    public readonly genders = GENDERS;

    public get groupsObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListWithoutDefaultGroupObservable();
    }

    public get isUserInScope(): boolean {
        return this._isUserInScope;
    }

    private _isUserInScope = true;

    constructor(
        @Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog,
        private participantRepo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private userService: UserService
    ) {}

    public ngOnInit(): void {
        this.updateIsUserInScope();
    }

    public getOtherUsersObservable(): Observable<ViewUser[]> {
        const user = this.participantRepo.getViewModel(this.infoDialog.id)!;
        return this.participantRepo
            .getViewModelListObservable()
            .pipe(map(_users => _users.filter(_user => _user.id !== user.id)));
    }

    private async updateIsUserInScope(): Promise<void> {
        this._isUserInScope = await this.userService.isUserInSameScope(this.infoDialog.id);
    }
}
