import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { GENDERS } from 'src/app/domain/models/users/user';
import { UserStateField } from 'src/app/gateways/repositories/users';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { ParticipantCsvExportService } from '../../../../export/participant-csv-export.service';
import { ParticipantPdfExportService } from '../../../../export/participant-pdf-export.service';
import { GroupControllerService, ViewGroup } from '../../../../modules';
import { ParticipantListInfoDialogService } from '../../modules/participant-list-info-dialog';
import { ParticipantListFilterService } from '../../services/participant-list-filter.service/participant-list-filter.service';
import { ParticipantListSortService } from '../../services/participant-list-sort.service/participant-list-sort.service';

const PARTICIPANTS_LIST_STORAGE_INDEX = `participants`;

export function areGroupsDiminished(oldGroupIds: number[], newGroupIds: number[], activeMeeting: ViewMeeting): boolean {
    return (
        oldGroupIds
            .filter(group => group !== activeMeeting.default_group_id)
            .some(id => !(newGroupIds ?? []).includes(id)) && !newGroupIds.includes(activeMeeting.admin_group_id)
    );
}

@Component({
    selector: `os-participant-list`,
    templateUrl: `./participant-list.component.html`,
    styleUrls: [`./participant-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantListComponent extends BaseMeetingListViewComponent<ViewUser> implements OnInit {
    /**
     * All available groups, where the user can be in.
     */
    public groupsObservable: Observable<ViewGroup[]> = this.groupRepo.getViewModelListWithoutDefaultGroupObservable();

    /**
     * The list of all genders.
     */
    public genderList = GENDERS;

    /**
     * Stores the observed configuration if the presence view is available to administrators
     */
    private _presenceViewConfigured = false;

    /**
     * @returns true if the presence view is available to administrators
     */
    public get presenceViewConfigured(): boolean {
        return this._presenceViewConfigured && this.operator.hasPerms(Permission.userCanManage);
    }

    private voteWeightEnabled = false;
    public voteDelegationEnabled = false;

    /**
     * Helper to check for main button permissions
     *
     * @returns true if the user should be able to create users
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    public get showVoteWeight(): boolean {
        return this._isElectronicVotingEnabled && this.voteWeightEnabled;
    }

    public get totalVoteWeight(): number {
        let votes;
        if (this.listComponent) {
            votes = this.listComponent.source?.reduce(
                (previous, current) => previous + (current.vote_weight() || 0),
                0
            );
        }
        return votes ?? 0;
    }

    public get isUserInScope(): boolean {
        return this._isUserInScope;
    }

    /**
     * Define extra filter properties
     */
    public filterProps = [`full_name`, `groups`, `structure_level`, `number`, `delegationName`];

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    private _allowSelfSetPresent = false;
    private _isElectronicVotingEnabled = false;
    private _isUserInScope = true;

    private readonly selfGroupRemovalDialogTitle = _(`This action will remove you from one or more groups.`);
    private readonly selfGroupRemovalDialogContent = _(
        `This may diminish your ability to do things in this meeting and you may not be able to revert it by youself. Are you sure you want to do this?`
    );

    public constructor(
        protected override translate: TranslateService,
        public repo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private choiceService: ChoiceService,
        public operator: OperatorService,
        public filterService: ParticipantListFilterService,
        public sortService: ParticipantListSortService,
        private csvExport: ParticipantCsvExportService,
        private pdfExport: ParticipantPdfExportService,
        private infoDialog: ParticipantListInfoDialogService,
        private organizationSettingsService: OrganizationSettingsService,
        private route: ActivatedRoute,
        private prompt: PromptService,
        private interactionService: InteractionService
    ) {
        super();

        // enable multiSelect for this listView
        this.canMultiSelect = true;
        this.listStorageIndex = PARTICIPANTS_LIST_STORAGE_INDEX;

        this.subscriptions.push(
            this.organizationSettingsService
                .get(`enable_electronic_voting`)
                .subscribe(is => (this._isElectronicVotingEnabled = is)),
            this.meetingSettingsService
                .get(`users_enable_presence_view`)
                .subscribe(state => (this._presenceViewConfigured = state)),
            this.meetingSettingsService
                .get(`users_enable_vote_weight`)
                .subscribe(enabled => (this.voteWeightEnabled = enabled)),
            this.meetingSettingsService
                .get(`users_enable_vote_delegations`)
                .subscribe(enabled => (this.voteDelegationEnabled = enabled)),
            this.meetingSettingsService
                .get(`users_allow_self_set_present`)
                .subscribe(allowed => (this._allowSelfSetPresent = allowed))
        );
    }

    /**
     * Init function
     *
     * sets the title, inits the table, sets sorting and filter options, subscribes
     * to filter/sort services
     */
    public ngOnInit(): void {
        super.setTitle(`Participants`);
    }

    /**
     * Handles the click on the plus button
     */
    public onPlusButton(): void {
        this.router.navigate([`new`], { relativeTo: this.route });
    }

    public isUserPresent(user: ViewUser): boolean {
        return user.isPresentInMeeting();
    }

    public isPresentToggleDisabled(user: ViewUser): boolean {
        if (this.isMultiSelect) {
            return true;
        } else if (this._allowSelfSetPresent && this.operator.operatorId === user.id) {
            return false;
        } else {
            return !this.operator.hasPerms(Permission.userCanManage, Permission.userCanManagePresence);
        }
    }

    /**
     * This function opens the dialog,
     * where the user can quick change the groups,
     * the gender and the participant number.
     *
     * @param user is an instance of ViewUser. This is the given user, who will be modified.
     */
    public async openEditInfo(user: ViewUser, ev: MouseEvent): Promise<void> {
        if (this.isMultiSelect || !this.operator.hasPerms(Permission.userCanManage)) {
            return;
        }
        ev.stopPropagation();
        const dialogRef = await this.infoDialog.open({
            id: user.id,
            name: user.username,
            group_ids: user.group_ids(),
            structure_level: user.structure_level(),
            number: user.number(),
            vote_delegations_from_ids: user.vote_delegations_from_meeting_user_ids(),
            vote_delegated_to_id: user.vote_delegated_to_meeting_user_id()
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                if (!result.group_ids?.length) {
                    result.group_ids = [this.activeMeeting!.default_group_id];
                }
                if (result.vote_delegated_to_id === 0) {
                    result.vote_delegated_to_id = null;
                }
                if (
                    !(
                        user.id === this.operator.operatorId &&
                        areGroupsDiminished(this.operator.user.group_ids(), result.group_ids, this.activeMeeting)
                    ) ||
                    (await this.prompt.open(this.selfGroupRemovalDialogTitle, this.selfGroupRemovalDialogContent))
                ) {
                    this.repo.update(result, user).resolve();
                }
            }
        });
    }

    public getOtherUsersObservable(user: ViewUser): Observable<ViewUser[]> {
        return this.repo.getViewModelListObservable().pipe(map(users => users.filter(_user => _user.id !== user.id)));
    }

    /**
     * Export all users currently matching the filter
     * as CSV (including personal information such as initial passwords)
     */
    public csvExportUserList(): void {
        this.csvExport.export(this.listComponent.source);
    }

    /**
     * Export all users currently matching the filter as PDF
     * (access information, including personal information such as initial passwords)
     */
    public onDownloadAccessPdf(): void {
        this.pdfExport.exportAccessDocuments(...this.listComponent.source);
    }

    /**
     * triggers the download of a simple participant list (no details on user name and passwords)
     * with all users currently matching the filter
     */
    public pdfExportUserList(): void {
        this.pdfExport.exportParticipants(...this.listComponent.source);
    }

    /**
     * Opens a dialog and sets the group(s) for all selected users.
     * SelectedRows is only filled with data in multiSelect mode
     */
    public async setGroupSelected(): Promise<void> {
        const content = _(`This will add or remove the following groups for all selected participants:`);
        const ADD = _(`add group(s)`);
        const REMOVE = _(`remove group(s)`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(content, this.groupsObservable, true, choices);
        if (selectedChoice && selectedChoice.ids.length) {
            const chosenGroupIds = selectedChoice.ids as Ids;
            if (selectedChoice.action === ADD) {
                this.repo
                    .update(user => {
                        const nextGroupIds = user.group_ids().filter(id => this.activeMeeting.default_group_id !== id);
                        return {
                            id: user.id,
                            group_ids: [...new Set(nextGroupIds.concat(chosenGroupIds))]
                        };
                    }, ...this.selectedRows)
                    .resolve();
            } else if (
                this.selectedRows.every(
                    user =>
                        !(
                            user.id === this.operator.operatorId &&
                            areGroupsDiminished(
                                this.operator.user.group_ids(),
                                this.operator.user.group_ids().filter(id => !chosenGroupIds.includes(id)),
                                this.activeMeeting
                            )
                        )
                ) ||
                (await this.prompt.open(this.selfGroupRemovalDialogTitle, this.selfGroupRemovalDialogContent))
            ) {
                this.repo
                    .update(user => {
                        const nextGroupIds = new Set(user.group_ids());
                        chosenGroupIds.forEach(id => nextGroupIds.delete(id));
                        return {
                            id: user.id,
                            group_ids:
                                nextGroupIds.size === 0
                                    ? [this.activeMeeting.default_group_id]
                                    : Array.from(nextGroupIds)
                        };
                    }, ...this.selectedRows)
                    .resolve();
            }
        }
    }

    public async changeActiveStateOfSelectedUsers(): Promise<void> {
        await this.setStateSelected(`is_active`);
    }

    public async changePresentStateOfSelectedUsers(): Promise<void> {
        await this.setStateSelected(`is_present_in_meetings`);
    }

    public async changePhysicalStateOfSelectedUsers(): Promise<void> {
        await this.setStateSelected(`is_physical_person`);
    }

    /**
     * Sets the user present
     *
     * @param viewUser the viewUser Object
     */
    public setPresent(viewUser: ViewUser): void {
        const isAllowed =
            this.operator.hasPerms(Permission.userCanManage, Permission.userCanManagePresence) ||
            (this._allowSelfSetPresent && this.operator.operatorId === viewUser.id);
        if (isAllowed) {
            this.repo.setPresent(!this.isUserPresent(viewUser), viewUser).resolve();
        }
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    protected async removeUsersFromMeeting(): Promise<void> {
        await this.repo.removeUsersFromMeeting(this.selectedRows);
    }

    /**
     * Handler for bulk setting/unsetting the 'active' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    private async setStateSelected(field: UserStateField): Promise<void> {
        let actions: [string, string];
        switch (field) {
            case `is_active`:
                actions = [_(`active`), _(`inactive`)];
                break;
            case `is_present_in_meetings`:
                actions = [_(`present`), _(`absent`)];
                break;
            case `is_physical_person`:
                actions = [_(`natural person`), _(`no natural person`)];
                break;
        }
        const content = _(`Set status for selected participants:`);

        const selectedChoice = await this.choiceService.open({ title: content, multiSelect: false, actions });
        if (selectedChoice) {
            const value = selectedChoice.action === actions[0];
            if (field === `is_present_in_meetings`) {
                await this.repo.setPresent(value, ...this.selectedRows).resolve();
            } else {
                await this.repo.setState(field, value, ...this.selectedRows);
            }
        }
    }
}
