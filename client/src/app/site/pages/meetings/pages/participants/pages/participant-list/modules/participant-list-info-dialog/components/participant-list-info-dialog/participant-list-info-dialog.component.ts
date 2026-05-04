import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { GENDERS } from 'src/app/domain/models/users/user';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ModelRequestService, SubscribeToConfig } from 'src/app/site/services/model-request.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { getParticipantListSubscriptionConfig } from '../../../../../../participants.subscription';
import { StructureLevelControllerService } from '../../../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../../../structure-levels/view-models';
import { ParticipantListSortService } from '../../../../services/participant-list-sort/participant-list-sort.service';
import { InfoDialog } from '../../services/participant-list-info-dialog.service';

@Component({
    selector: `os-participant-list-info-dialog`,
    templateUrl: `./participant-list-info-dialog.component.html`,
    styleUrls: [`./participant-list-info-dialog.component.scss`],
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
    private participantSubscriptionConfig: SubscribeToConfig;
    public userList = this.participantRepo.getViewModelListObservable();
    private modelRequest = inject(ModelRequestService);

    public constructor(
        @Inject(MAT_DIALOG_DATA) public readonly infoDialog: InfoDialog,
        private participantRepo: ParticipantControllerService,
        private userSortService: ParticipantListSortService,
        private groupRepo: GroupControllerService,
        private structureLevelRepo: StructureLevelControllerService,
        private meetingSettings: MeetingSettingsService,
        private activeMeetingIdService: ActiveMeetingIdService,
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
        this.modelRequest.subscribeTo({
            ...this.participantSubscriptionConfig,
            subscriptionName: 'participant_minimal_delegation_dialog:subscription'
        });
        console.log(this.userRepo);
        this._currentUser = this.participantRepo.getViewModel(this.infoDialog.id);
        this.structureLevelObservable = this.structureLevelRepo.getViewModelListObservable();
        this.subscriptions.push(
            this.userList.subscribe(participants =>
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
        this.modelRequest.closeSubscription('participant_minimal_delegation_dialog:subscription');
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
}
