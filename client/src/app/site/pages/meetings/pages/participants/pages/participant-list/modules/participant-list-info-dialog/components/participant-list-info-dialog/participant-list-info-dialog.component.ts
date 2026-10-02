import { ChangeDetectionStrategy, Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Permission } from '@app/domain/definitions/permission';
import { Selectable } from '@app/domain/interfaces/selectable';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';
import { GENDERS } from '@app/domain/models/users/user';
import { StructureLevelRepositoryService } from '@app/gateways/repositories/structure-levels';
import { UserRepositoryService } from '@app/gateways/repositories/users';
import { ViewGroup } from '@app/site/pages/meetings/pages/participants';
import { GroupControllerService } from '@app/site/pages/meetings/pages/participants/modules';
import { ParticipantControllerService } from '@app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeetingUser } from '@app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { BaseUiComponent } from '@app/ui/base/base-ui-component';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

import {
    getParticipantListSubscriptionConfig,
    getStructureLevelListSubscriptionConfig
} from '../../../../../../participants.subscription';
import { ViewStructureLevel } from '../../../../../structure-levels/view-models/view-structure-level';
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
    protected structureLevelRepo = inject(StructureLevelRepositoryService);
    protected participantRepo = inject(ParticipantControllerService);
    private userRepo: UserRepositoryService = inject(UserRepositoryService);
    private groupRepo = inject(GroupControllerService);
    private operator = inject(OperatorService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);
    private meetingSettings = inject(MeetingSettingsService);
    private userSortService = inject(ParticipantListSortService);

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

    protected participantSubscriptionConfig: SubscriptionConfig<ViewUser>;
    protected structureLevelConfig: SubscriptionConfig<ViewStructureLevel>;
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled = false;
    private readonly _otherParticipantsSubject = new BehaviorSubject<ViewMeetingUser[]>([]);

    public constructor(@Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog) {
        super();
    }

    public ngOnInit(): void {
        this.userSortService.initSorting();
        this.participantSubscriptionConfig = getParticipantListSubscriptionConfig(
            this.activeMeetingIdService.meetingId
        );
        this.structureLevelConfig = getStructureLevelListSubscriptionConfig(this.activeMeetingIdService.meetingId);
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
        observable$.pipe(
            map((users: ViewUser[]) =>
                users.filter(user => user.id !== this._currentUser?.id).map(user => user.getMeetingUser())
            )
        );
}
