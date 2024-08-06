import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { GENDERS } from 'src/app/domain/models/users/user';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { StructureLevelControllerService } from '../../../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../../../structure-levels/view-models';
import { ParticipantListSortService } from '../../../../services/participant-list-sort/participant-list-sort.service';
import { InfoDialog } from '../../services/participant-list-info-dialog.service';

@Component({
    selector: `os-participant-list-info-dialog`,
    templateUrl: `./participant-list-info-dialog.component.html`,
    styleUrls: [`./participant-list-info-dialog.component.scss`]
})
export class ParticipantListInfoDialogComponent extends BaseUiComponent implements OnInit, OnDestroy {
    public readonly genders = GENDERS;

    public get groupsObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListWithoutDefaultGroupObservable();
    }

    public get otherParticipantsObservable(): Observable<ViewMeetingUser[]> {
        return this._otherParticipantsSubject;
    }

    public get showVoteDelegations(): boolean {
        return this._voteDelegationEnabled;
    }

    public structureLevelObservable: Observable<ViewStructureLevel[]>;

    private readonly _otherParticipantsSubject = new BehaviorSubject<ViewMeetingUser[]>([]);
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled = false;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog,
        private participantRepo: ParticipantControllerService,
        private userSortService: ParticipantListSortService,
        private groupRepo: GroupControllerService,
        private structureLevelRepo: StructureLevelControllerService,
        private meetingSettings: MeetingSettingsService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.userSortService.initSorting();
        this._currentUser = this.participantRepo.getViewModel(this.infoDialog.id);
        this.structureLevelObservable = this.structureLevelRepo.getViewModelListObservable();
        this.subscriptions.push(
            this.participantRepo
                .getSortedViewModelListObservable(this.userSortService.repositorySortingKey)
                .subscribe(participants =>
                    this._otherParticipantsSubject.next(
                        participants
                            .filter(participant => participant.id !== this._currentUser.id)
                            .map(participant => participant.getMeetingUser())
                    )
                ),
            this.meetingSettings
                .get(`users_enable_vote_delegations`)
                .subscribe(enabled => (this._voteDelegationEnabled = enabled))
        );
    }

    public override ngOnDestroy(): void {
        this.userSortService.exitSortService();
        super.ngOnDestroy();
    }
}
