import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { GENDERS } from 'src/app/domain/models/users/user';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { UserService } from 'src/app/site/services/user.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { InfoDialog } from '../../services/participant-list-info-dialog.service';

@Component({
    selector: `os-participant-list-info-dialog`,
    templateUrl: `./participant-list-info-dialog.component.html`,
    styleUrls: [`./participant-list-info-dialog.component.scss`]
})
export class ParticipantListInfoDialogComponent extends BaseUiComponent implements OnInit {
    public readonly genders = GENDERS;

    public get groupsObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListWithoutDefaultGroupObservable();
    }

    public get otherParticipantsObservable(): Observable<ViewUser[]> {
        return this._otherParticipantsSubject;
    }

    public get isUserInScope(): boolean {
        return this._isUserInScope;
    }

    private readonly _otherParticipantsSubject = new BehaviorSubject<ViewUser[]>([]);
    private _isUserInScope = true;
    private _currentUser: ViewUser | null = null;

    constructor(
        @Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog,
        private participantRepo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private userService: UserService
    ) {
        super();
    }

    public ngOnInit(): void {
        this._currentUser = this.participantRepo.getViewModel(this.infoDialog.id);
        this.updateIsUserInScope();
        this.subscriptions.push(
            this.participantRepo
                .getViewModelListObservable()
                .subscribe(participants =>
                    this._otherParticipantsSubject.next(
                        participants.filter(participant => participant.id !== this._currentUser.id)
                    )
                )
        );
    }

    private async updateIsUserInScope(): Promise<void> {
        this._isUserInScope = await this.userService.isUserInSameScope(this.infoDialog.id);
    }
}
