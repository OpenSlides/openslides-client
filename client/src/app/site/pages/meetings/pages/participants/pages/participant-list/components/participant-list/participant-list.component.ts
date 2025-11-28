import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { GENDERS } from 'src/app/domain/models/users/user';
import { UserStateField } from 'src/app/gateways/repositories/users';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { OsFilterOption } from 'src/app/site/base/base-filter.service';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserService } from 'src/app/site/services/user.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { ParticipantCsvExportService } from '../../../../export/participant-csv-export.service';
import { ParticipantPdfExportService } from '../../../../export/participant-pdf-export.service';
import { GroupControllerService, ViewGroup } from '../../../../modules';
import { StructureLevelControllerService } from '../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../structure-levels/view-models';
import { ParticipantListInfoDialogService } from '../../modules/participant-list-info-dialog';
import { ParticipantListFilterService } from '../../services/participant-list-filter/participant-list-filter.service';
import { ParticipantListSortService } from '../../services/participant-list-sort/participant-list-sort.service';
import { ParticipantSwitchDialogComponent } from '../participant-switch-dialog/participant-switch-dialog.component';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ParticipantListComponent extends BaseMeetingListViewComponent<ViewUser> implements OnInit {
    /**
     * All available groups, where the user can be in.
     */
    public groupsObservable: Observable<ViewGroup[]> = this.groupRepo.getViewModelListWithoutSystemGroupsObservable();

    /**
     * All available structure level, where the user can be in.
     */
    public structureLevelObservable: Observable<ViewStructureLevel[]> =
        this.structureLevelRepo.getViewModelListStructureLevelObservable();

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
        return this._presenceViewConfigured && this.operator.hasPerms(Permission.userCanUpdate);
    }

    private voteWeightEnabled = false;
    public voteDelegationEnabled = false;

    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    public get canUpdate(): boolean {
        return this.operator.hasPerms(Permission.userCanUpdate);
    }

    public get canSeeSensitiveData(): boolean {
        return this.operator.hasPerms(Permission.userCanSeeSensitiveData);
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

    public get isFilteringCanVoteForGroups(): boolean {
        return !!this.filterService.activeFilters.filter(
            flt => flt.property === `canVoteForGroups` && flt.options.some((opt: OsFilterOption) => opt.isActive)
        ).length;
    }

    public get totalEligibleVoteWeights(): number[] {
        const voters: Record<number, number> = {};
        const checkGroups = this.filterService.activeFilters
            .filter(flt => flt.property === `canVoteForGroups`)
            .flatMap(flt =>
                flt.options.filter((opt: OsFilterOption) => opt.isActive).map((opt: OsFilterOption) => opt.condition)
            );
        if (this.listComponent) {
            for (const user of this.listComponent.source ?? []) {
                if (checkGroups.intersect(user.group_ids()).length > 0) {
                    voters[user.id] = user.vote_weight();
                }
                for (const principal of user.vote_delegations_from()) {
                    if (checkGroups.intersect(principal.group_ids()).length > 0) {
                        voters[principal.id] = principal.vote_weight();
                    }
                }
            }
        }
        const weights = Object.values(voters);
        return weights;
    }

    public get totalEligibleVoteWeight(): number {
        return this.totalEligibleVoteWeights.reduce((partialSum, a) => partialSum + a, 0);
    }

    public isInPolldefaultGroup(user: ViewUser): boolean {
        let isInDefaultGroup = false;
        user.group_ids().forEach(id => {
            if (this._poll_default_group_ids.indexOf(id) > -1) {
                isInDefaultGroup = true;
                return;
            }
        });
        return isInDefaultGroup;
    }

    public sumOfDelegatedVoteWeight(user: ViewUser): number {
        let voteWeights = 0;
        user.vote_delegations_from().forEach(user => (voteWeights += user.vote_weight()));

        return voteWeights;
    }

    public get isUserInScope(): boolean {
        return this._isUserInScope;
    }

    protected get hasStructureLevels(): boolean {
        return this.structureLevelRepo.getViewModelListStructureLevel().length > 0;
    }

    protected get filterProps(): string[] {
        if (this.canSeeSensitiveData) {
            return [
                `full_name`,
                `groups`,
                `number`,
                `delegationName`,
                `structure_levels`,
                `member_number`,
                `email`,
                `username`
            ];
        } else {
            return [`full_name`, `groups`, `number`, `delegationName`, `structure_levels`];
        }
    }

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    private _allowSelfSetPresent = false;
    private _isElectronicVotingEnabled = false;
    private _isUserInScope = true;

    private _poll_default_group_ids: number[] = [];

    private readonly selfGroupRemovalDialogTitle = _(`This action will remove you from one or more groups.`);
    private readonly selfGroupRemovalDialogContent = _(
        `This may diminish your ability to do things in this meeting and you may not be able to revert it by youself. Are you sure you want to do this?`
    );

    public constructor(
        protected override translate: TranslateService,
        public repo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private userRepo: UserControllerService,
        private userService: UserService,
        private structureLevelRepo: StructureLevelControllerService,
        private choiceService: ChoiceService,
        public operator: OperatorService,
        public filterService: ParticipantListFilterService,
        public sortService: ParticipantListSortService,
        public viewport: ViewPortService,
        private csvExport: ParticipantCsvExportService,
        private pdfExport: ParticipantPdfExportService,
        private infoDialog: ParticipantListInfoDialogService,
        private organizationSettingsService: OrganizationSettingsService,
        private route: ActivatedRoute,
        private prompt: PromptService,
        private interactionService: InteractionService,
        private dialog: MatDialog
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
                .subscribe(allowed => (this._allowSelfSetPresent = allowed)),
            this.meetingSettingsService
                .get(`assignment_poll_default_group_ids`)
                .subscribe(group_ids => (this._poll_default_group_ids = Array.from(group_ids))),
            this.meetingSettingsService.get(`motion_poll_default_group_ids`).subscribe(group_ids =>
                group_ids?.forEach(id => {
                    if (this._poll_default_group_ids.indexOf(id) === -1) {
                        this._poll_default_group_ids.push(id);
                    }
                })
            ),
            this.meetingSettingsService.get(`topic_poll_default_group_ids`).subscribe(group_ids =>
                group_ids?.forEach(id => {
                    if (this._poll_default_group_ids.indexOf(id) === -1) {
                        this._poll_default_group_ids.push(id);
                    }
                })
            )
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

    public canChangePassword(user: ViewUser): boolean {
        const userOML = user?.organization_management_level;
        const sufficientOML = userOML ? this.operator.hasOrganizationPermissions(userOML as OML) : true;
        return !user?.saml_id && this.userService.isAllowed(`changePassword`, false) && sufficientOML;
    }

    public canEditOwnDelegation(user: ViewUser): boolean {
        if (
            this.operator.hasPerms(Permission.userCanEditOwnDelegation) &&
            !this.operator.hasPerms(Permission.userCanManage) &&
            !this.operator.hasPerms(Permission.userCanUpdate)
        ) {
            return this.operator.operatorId === user.id;
        } else if (
            this.operator.hasPerms(Permission.userCanManage) ||
            this.operator.hasPerms(Permission.userCanUpdate)
        ) {
            return true;
        } else {
            return false;
        }
    }

    public isUserPresent(user: ViewUser): boolean {
        return user.isPresentInMeeting();
    }

    public isUserLockedOut(user: ViewUser): boolean {
        return user.isLockedOutOfMeeting();
    }

    public isPresentToggleDisabled(user: ViewUser): boolean {
        if (this.isMultiSelect) {
            return true;
        } else if (this._allowSelfSetPresent && this.operator.operatorId === user.id) {
            return false;
        } else {
            return !this.operator.hasPerms(Permission.userCanManagePresence);
        }
    }

    public isLockedOutToggleDisabled(user: ViewUser): boolean {
        if (this.isMultiSelect) {
            return true;
        } else if (!this.filterForLockedOut(user)) {
            return true;
        } else {
            return !this.canUpdate;
        }
    }

    private filterForLockedOut(user: ViewUser): boolean {
        return (
            this.operator.operatorId !== user.id &&
            !user.organization_management_level &&
            !user.committee_management_ids?.includes(this.activeMeeting.committee_id) &&
            !user.groups().some(group => group.hasPermission(Permission.userCanManage))
        );
    }

    /**
     * This function opens the dialog,
     * where the user can quick change the groups,
     * the gender and the participant number.
     *
     * @param user is an instance of ViewUser. This is the given user, who will be modified.
     */
    public async openEditInfo(user: ViewUser, ev?: MouseEvent): Promise<void> {
        if (
            (this.isMultiSelect || !this.operator.hasPerms(Permission.userCanUpdate)) &&
            !this.canEditOwnDelegation(user)
        ) {
            return;
        }
        ev?.stopPropagation();
        const dialogRef = await this.infoDialog.open({
            id: user.id,
            name: user.username,
            group_ids: user.group_ids(),
            number: user.number(),
            structure_level_ids: user.structure_level_ids(),
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
                    if (
                        this.operator.hasPerms(Permission.userCanEditOwnDelegation) &&
                        !this.operator.hasPerms(Permission.userCanManage) &&
                        !this.operator.hasPerms(Permission.userCanUpdate) &&
                        user.id === this.operator.operatorId
                    ) {
                        this.repo.updateSelfDelegation(result, user);
                    } else {
                        this.repo.update(result, user).resolve();
                    }
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
                    .update(
                        user => {
                            const nextGroupIds = user
                                .group_ids()
                                .filter(id => this.activeMeeting.default_group_id !== id);
                            return {
                                id: user.id,
                                group_ids: [...new Set(nextGroupIds.concat(chosenGroupIds))]
                            };
                        },
                        ...this.selectedRows
                    )
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
                    .update(
                        user => {
                            const nextGroupIds = new Set(user.group_ids());
                            chosenGroupIds.forEach(id => nextGroupIds.delete(id));
                            return {
                                id: user.id,
                                group_ids:
                                    nextGroupIds.size === 0
                                        ? [this.activeMeeting.default_group_id]
                                        : Array.from(nextGroupIds)
                            };
                        },
                        ...this.selectedRows
                    )
                    .resolve();
            }
        }
    }

    /**
     * Opens a dialog and sets the structure level(s) for all selected users.
     * SelectedRows is only filled with data in multiSelect mode
     */
    public async setStructureLevelSelected(): Promise<void> {
        const content = _(`This will add or remove the following structure levels for all selected participants:`);
        const ADD = _(`Add`);
        const REMOVE = _(`Remove`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(content, this.structureLevelObservable, true, choices);
        if (selectedChoice && selectedChoice.ids.length) {
            const chosenStructureLevelIds = selectedChoice.ids as Ids;
            if (selectedChoice.action === ADD) {
                this.repo
                    .update(
                        user => {
                            const nextStructureLevelIds = user.structure_level_ids() || [];
                            return {
                                id: user.id,
                                structure_level_ids: [...new Set(nextStructureLevelIds.concat(chosenStructureLevelIds))]
                            };
                        },
                        ...this.selectedRows
                    )
                    .resolve();
            } else {
                this.repo
                    .update(
                        user => {
                            const nextStructureLevelIds = new Set(user.structure_level_ids() || []);
                            chosenStructureLevelIds.forEach(id => nextStructureLevelIds.delete(id));
                            return {
                                id: user.id,
                                structure_level_ids: Array.from(nextStructureLevelIds)
                            };
                        },
                        ...this.selectedRows
                    )
                    .resolve();
            }
        }
    }

    public async switchParticipants(user: ViewUser): Promise<void> {
        const leftUser = user;
        const dialogRef = this.dialog.open(ParticipantSwitchDialogComponent, {
            ...mediumDialogSettings,
            data: { leftUser }
        });
        const response = await firstValueFrom(dialogRef.afterClosed());
        if (response) {
            try {
                await this.repo
                    .update(
                        user => {
                            const other = user.id === leftUser.id ? response.rightUser : leftUser;
                            return {
                                group_ids: other.group_ids(),
                                number: other.number() ?? ``
                            };
                        },
                        leftUser,
                        response.rightUser as ViewUser
                    )
                    .resolve(false);
                this.matSnackBar.open(
                    this.translate.instant(`Mandates switched sucessfully!`),
                    this.translate.instant(`Ok`),
                    { duration: 3000 }
                );
            } catch (e) {
                this.raiseError(e);
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

    public async changeLockedOutStateOfSelectedUsers(): Promise<void> {
        await this.setStateSelected(`locked_out`);
    }

    /**
     * Sets the user present
     *
     * @param viewUser the viewUser Object
     */
    public setPresent(viewUser: ViewUser): void {
        const isAllowed =
            this.operator.hasPerms(Permission.userCanManagePresence) ||
            (this._allowSelfSetPresent && this.operator.operatorId === viewUser.id);
        if (isAllowed) {
            this.repo.setPresent(!this.isUserPresent(viewUser), viewUser).resolve();
        }
    }

    /**
     * Toggles the lockout
     */
    public async toggleLockout(viewUser: ViewUser): Promise<void> {
        const isAllowed = this.canUpdate;
        if (isAllowed) {
            const title = this.isUserLockedOut(viewUser)
                ? this.translate.instant(`Do you really want to undo the lock out of the participant?`)
                : this.translate.instant(`Do you really want to lock this participant out of the meeting?`);
            const content = viewUser.full_name;
            if (await this.prompt.open(title, content)) {
                this.repo.setState(`locked_out`, !this.isUserLockedOut(viewUser), viewUser);
            }
        }
    }

    public async sendInvitationEmail(viewUser: ViewUser): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to send an invitation email?`);
        const content = viewUser.full_name;
        if (await this.prompt.open(title, content)) {
            this.userRepo
                .sendInvitationEmails([viewUser], this.activeMeetingIdService.meetingId)
                .then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Deletes user.
     */
    public async removeUserFromMeeting(user: ViewUser): Promise<void> {
        await this.repo.removeUsersFromMeeting([user]);
    }

    public canSeeItemMenu(): boolean {
        return (
            this.operator.hasPerms(Permission.userCanUpdate) ||
            this.operator.hasPerms(Permission.userCanEditOwnDelegation)
        );
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
            case `locked_out`:
                actions = [_(`Locked out`), _(`Not locked out`)];
                break;
        }
        const content = _(`Set status for selected participants:`);

        const selectedChoice = await this.choiceService.open({ title: content, multiSelect: false, actions });
        if (selectedChoice) {
            const value = selectedChoice.action === actions[0];
            if (field === `is_present_in_meetings`) {
                await this.repo.setPresent(value, ...this.selectedRows).resolve();
            } else if (field === `locked_out`) {
                const filteredRows = this.selectedRows.filter(user => this.filterForLockedOut(user));
                if (filteredRows.length > 0) {
                    await this.repo.setState(field, value, ...filteredRows);
                }
                const missing = this.selectedRows.length - filteredRows.length;
                if (missing > 0) {
                    this.matSnackBar.open(
                        this.translate
                            .instant(
                                `%num% participants could not be locked out because they have administrative permissions.`
                            )
                            .replace(`%num%`, missing),
                        this.translate.instant(`Ok`),
                        { duration: 3000 }
                    );
                }
            } else if (
                field === 'is_active' &&
                !value &&
                this.operator.isOrgaManager &&
                this.selectedRows.some(user => user.id === this.operator.user.id)
            ) {
                if (this.selectedRows.length === 1) {
                    this.matSnackBar.open(this.translate.instant(`You cannot set yourself as inactive.`), `Ok`);
                } else {
                    const filteredRows = this.selectedRows.filter(user => user.id !== this.operator.user.id);
                    this.repo.setState(field, value, ...filteredRows);
                    this.matSnackBar.open(
                        this.translate.instant(`Accounts were set to inactive, except for your own account.`),
                        `Ok`
                    );
                }
            } else {
                await this.repo.setState(field, value, ...this.selectedRows);
            }
        }
    }

    public ariaLabel(user: ViewUser): string {
        return this.translate.instant(`Navigate to participant page from `) + user.short_name;
    }

    public goToEditUser(userId: number): void {
        this.router.navigate([userId, `edit`], { relativeTo: this.route });
    }
}
