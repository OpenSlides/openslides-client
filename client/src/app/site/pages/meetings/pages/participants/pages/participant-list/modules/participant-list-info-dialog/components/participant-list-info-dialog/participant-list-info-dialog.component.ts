import { ChangeDetectionStrategy, Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Permission } from '@app/domain/definitions/permission';
import { Selectable } from '@app/domain/interfaces/selectable';
import { GENDERS } from '@app/domain/models/users/user';
import { ViewGroup } from '@app/site/pages/meetings/pages/participants';
import { GroupControllerService } from '@app/site/pages/meetings/pages/participants/modules';
import { ParticipantControllerService } from '@app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeetingUser } from '@app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { BaseUiComponent } from '@app/ui/base/base-ui-component';
import { BehaviorSubject, Observable } from 'rxjs';

import { getParticipantListSubscriptionConfig } from '../../../../../../participants.subscription';
import { StructureLevelControllerService } from '../../../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../../../structure-levels/view-models';
import { ParticipantListSortService } from '../../../../services/participant-list-sort/participant-list-sort.service';
import { InfoDialog } from '../../services/participant-list-info-dialog.service';

@Component({
    selector: `os-participant-list-info-dialog`,
    templateUrl: `./participant-list-info-dialog.component.html`,
    styleUrls: [`./participant-list-info-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ParticipantListInfoDialogComponent extends BaseUiComponent implements OnInit, OnDestroy {
    public readonly genders = GENDERS;

    public get groupsObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListWithoutSystemGroupsObservable();
    }

    public get otherParticipantsObservable(): Observable<ViewMeetingUser[]> {
        return this._otherParticipantsSubject;
    }

    public get showVoteDelegations(): boolean {
        return this._voteDelegationEnabled;
    }

    public get canOnlyEditOwnDelegation(): boolean {
        return (
            this.operator.hasPerms(Permission.userCanEditOwnDelegation) &&
            !this.operator.hasPerms(Permission.userCanManage) &&
            !this.operator.hasPerms(Permission.userCanUpdate)
        );
    }

    public structureLevelObservable: Observable<ViewStructureLevel[]>;

    private readonly _otherParticipantsSubject = new BehaviorSubject<ViewMeetingUser[]>([]);
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled = false;
    public userList = this.participantRepo.getViewModelListObservable();
    protected participantSubscriptionConfig: SubscriptionConfig<any>;

    protected setting: SettingsInput = {} as SettingsInput;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog,
        private participantRepo: ParticipantControllerService,
        private userSortService: ParticipantListSortService,
        private groupRepo: GroupControllerService,
        private structureLevelRepo: StructureLevelControllerService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private meetingSettings: MeetingSettingsService,
        private operator: OperatorService,
        protected userRepo: UserRepositoryService = inject(UserRepositoryService)
    ) {
        super();
    }

    public ngOnInit(): void {
        this.userSortService.initSorting();
        this.participantSubscriptionConfig = getParticipantListSubscriptionConfig(
            this.activeMeetingIdService.meetingId
        );
        this.setting.helpText = 'You can only delete delegations you have received';
        this._currentUser = this.participantRepo.getViewModel(this.infoDialog.id);
        this.subscriptions.push(
            this.userRepo
                .getGeneralViewModelObservable()
                .pipe(filter((participant: ViewUser) => participant.id !== this._currentUser.id))
                .subscribe((participant: ViewUser) => participant.getMeetingUser()),
            this.meetingSettings
                .get(`users_enable_vote_delegations`)
                .subscribe(enabled => (this._voteDelegationEnabled = enabled))
        );

        this.structureLevelObservable = this.structureLevelRepo.getViewModelListObservable();
    }

    public override ngOnDestroy(): void {
        this.userSortService.exitSortService();
        super.ngOnDestroy();
    }

    public getDisableOptionFn(vote_delegations: number[]): (value: Selectable) => boolean {
        if (this.canOnlyEditOwnDelegation) {
            return value => {
                return vote_delegations ? !vote_delegations.some(x => x === value.id) : true;
            };
        } else {
            return _ => false;
        }
    }

    public excludeCurrentUserFn: any = observable$ =>
        observable$.pipe(map((users: ViewUser[]) => users.filter(user => user.id !== this._currentUser?.id)));
}
