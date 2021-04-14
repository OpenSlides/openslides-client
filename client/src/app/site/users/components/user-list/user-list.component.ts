import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';
import { BehaviorSubject } from 'rxjs';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest, SpecificStructuredField } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService, UserStateField } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { genders } from 'app/shared/models/users/user';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { PollService } from 'app/site/polls/services/poll.service';
import { UserFilterListService } from '../../services/user-filter-list.service';
import { UserPdfExportService } from '../../services/user-pdf-export.service';
import { UserSortListService } from '../../services/user-sort-list.service';
import { ViewGroup } from '../../models/view-group';
import { ViewUser } from '../../models/view-user';

/**
 * Interface for the short editing dialog.
 * Describe, which values the dialog has.
 */
interface InfoDialog {
    /**
     * The name of the user.
     */
    name: string;

    /**
     * Define all the groups the user is in.
     */
    group_ids: number[];

    /**
     * The gender of the user.
     */
    gender: string;

    /**
     * The participant number of the user.
     */
    number: string;

    /**
     * Structure level for one user.
     */
    structure_level: string;

    /**
     * Transfer voting rights from
     */
    vote_delegations_from_ids: number[];

    /**
     * Transfer voting rights to
     */
    vote_delegated_to_id: number;
}

/**
 * Component for the user list view.
 */
@Component({
    selector: 'os-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    /**
     * The reference to the template.
     */
    @ViewChild('userInfoDialog', { static: true })
    private userInfoDialog: TemplateRef<string>;

    /**
     * Declares the dialog for editing.
     */
    public infoDialog: InfoDialog;

    /**
     * All available groups, where the user can be in.
     */
    public groups: ViewGroup[];

    public readonly users: BehaviorSubject<ViewUser[]> = new BehaviorSubject<ViewUser[]>([]);

    /**
     * The list of all genders.
     */
    public genderList = genders;

    /**
     * Stores the observed configuration if the presence view is available to administrators
     */
    private _presenceViewConfigured = false;

    /**
     * @returns true if the presence view is available to administrators
     */
    public get presenceViewConfigured(): boolean {
        return this._presenceViewConfigured && this.operator.hasPerms(Permission.usersCanManage);
    }

    private voteWeightEnabled: boolean;

    /**
     * Helper to check for main button permissions
     *
     * @returns true if the user should be able to create users
     */
    public get canAddUser(): boolean {
        return this.operator.hasPerms(Permission.usersCanManage);
    }

    public get canSeeExtra(): boolean {
        return this.operator.hasPerms(Permission.usersCanSeeExtraData);
    }

    public get showVoteWeight(): boolean {
        return this.pollService.isElectronicVotingEnabled && this.voteWeightEnabled;
    }

    public get totalVoteWeight(): number {
        const votes = this.dataSource?.filteredData?.reduce(
            (previous, current) => previous + (current.vote_weight() || 0),
            0
        );
        return votes ?? 0;
    }

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'short_name',
            width: 'auto'
        },
        {
            prop: 'group',
            width: '15%'
        },
        {
            prop: 'infos',
            width: this.singleButtonWidth
        },
        {
            prop: 'presence',
            width: '100px'
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = ['full_name', 'groups', 'structure_level', 'number', 'delegationName'];

    private allowSelfSetPresent: boolean;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        public repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private choiceService: ChoiceService,
        private router: Router,
        public operator: OperatorService,
        protected csvExport: CsvExportService,
        private promptService: PromptService,
        public filterService: UserFilterListService,
        public sortService: UserSortListService,
        private meetingSettingsService: MeetingSettingsService,
        private userPdf: UserPdfExportService,
        private dialog: MatDialog,
        private pollService: PollService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);

        // enable multiSelect for this listView
        this.canMultiSelect = true;
        this.meetingSettingsService
            .get('users_enable_presence_view')
            .subscribe(state => (this._presenceViewConfigured = state));
        this.meetingSettingsService
            .get('users_enable_vote_weight')
            .subscribe(enabled => (this.voteWeightEnabled = enabled));
        this.meetingSettingsService
            .get('users_allow_self_set_present')
            .subscribe(allowed => (this.allowSelfSetPresent = allowed));
    }

    /**
     * Init function
     *
     * sets the title, inits the table, sets sorting and filter options, subscribes
     * to filter/sort services
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle('Participants');

        // Initialize the groups
        this.groups = this.groupRepo.getViewModelList().filter(group => group.id !== 1);

        this.subscriptions.push(
            this.groupRepo
                .getViewModelListObservable()
                .subscribe(groups => (this.groups = groups.filter(group => group.id !== 1)))
        );
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: 'user_ids',
                    fieldset: 'list',
                    follow: [
                        {
                            idField: {
                                templateIdField: 'group_$_ids',
                                templateValue: this.activeMeetingIdService.meetingId?.toString()
                            }
                        },
                        {
                            idField: {
                                templateIdField: 'vote_delegated_$_to_id',
                                templateValue: this.activeMeetingIdService.meetingId?.toString()
                            }
                        }
                    ]
                }
            ],
            fieldset: []
        };
    }

    /**
     * Handles the click on the plus button
     */
    public onPlusButton(): void {
        this.router.navigate(['./new'], { relativeTo: this.route });
    }

    public isUserPresent(user: ViewUser): boolean {
        return user.isPresentInMeeting();
    }

    public isPresentToggleDisabled(user: ViewUser): boolean {
        if (this.isMultiSelect) {
            return true;
        } else if (this.allowSelfSetPresent && this.operator.operatorId === user.id) {
            return false;
        } else {
            return !this.operator.hasPerms(Permission.usersCanManage);
        }
    }

    /**
     * This function opens the dialog,
     * where the user can quick change the groups,
     * the gender and the participant number.
     *
     * @param user is an instance of ViewUser. This is the given user, who will be modified.
     */
    public openEditInfo(user: ViewUser, ev: MouseEvent): void {
        if (this.isMultiSelect || !this.operator.hasPerms(Permission.usersCanManage)) {
            return;
        }
        ev.stopPropagation();
        this.infoDialog = {
            name: user.username,
            group_ids: user.group_ids(this.activeMeetingIdService.meetingId),
            gender: user.gender,
            structure_level: user.structure_level(),
            number: user.number(),
            vote_delegations_from_ids: user.vote_delegations_from_ids(),
            vote_delegated_to_id: user.vote_delegated_to_id()
        };

        const dialogRef = this.dialog.open(this.userInfoDialog, infoDialogSettings);

        dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.key === 'Enter' && event.shiftKey) {
                dialogRef.close(this.infoDialog);
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.update(result, user);
            }
        });
    }

    /**
     * Export all users currently matching the filter
     * as CSV (including personal information such as initial passwords)
     */
    public csvExportUserList(): void {
        this.csvExport.export(
            this.dataSource.filteredData,
            [
                { property: 'title' },
                { property: 'first_name', label: 'Given name' },
                { property: 'last_name', label: 'Surname' },
                { property: 'structure_level', label: 'Structure level' },
                { property: 'number', label: 'Participant number' },
                {
                    label: 'groups',
                    map: user =>
                        user
                            .groups()
                            .map(group => group.name)
                            .join(',')
                },
                { property: 'comment' },
                { property: 'is_active', label: 'Is active' },
                { property: 'is_present_in_meetings', label: 'Is present in meeting' },
                { property: 'is_physical_person', label: 'Is a physical person' },
                { property: 'default_password', label: 'Initial password' },
                { property: 'email' },
                { property: 'username' },
                { property: 'gender' },
                { property: 'vote_weight', label: 'Vote weight' }
            ],
            this.translate.instant('Participants') + '.csv'
        );
    }

    /**
     * Export all users currently matching the filter as PDF
     * (access information, including personal information such as initial passwords)
     */
    public onDownloadAccessPdf(): void {
        this.userPdf.exportMultipleUserAccessPDF(this.dataSource.filteredData);
    }

    /**
     * triggers the download of a simple participant list (no details on user name and passwords)
     * with all users currently matching the filter
     */
    public pdfExportUserList(): void {
        this.userPdf.exportUserList(this.dataSource.filteredData);
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete all selected participants?');
        if (await this.promptService.open(title)) {
            this.repo.bulkDeleteTemporary(this.selectedRows).catch(this.raiseError);
        }
    }

    /**
     * Opens a dialog and sets the group(s) for all selected users.
     * SelectedRows is only filled with data in multiSelect mode
     */
    public async setGroupSelected(): Promise<void> {
        const content = this.translate.instant(
            'This will add or remove the following groups for all selected participants:'
        );
        const ADD = _('add group(s)');
        const REMOVE = _('remove group(s)');
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(content, this.groupRepo.getViewModelList(), true, choices);
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.repo.bulkAddGroupsToTemporaryUsers(this.selectedRows, selectedChoice.items as number[]);
            } else {
                this.repo.bulkRemoveGroupsFromTemporaryUsers(this.selectedRows, selectedChoice.items as number[]);
            }
        }
    }

    /**
     * Handler for bulk setting/unsetting the 'active' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    public async setStateSelected(field: UserStateField): Promise<void> {
        let options: [string, string];
        let verboseStateName: string;
        switch (field) {
            case 'is_active':
                options = [_('active'), _('inactive')];
                verboseStateName = 'active';
                break;
            case 'is_present_in_meetings':
                options = [_('present'), _('absent')];
                verboseStateName = 'present';
                break;
            case 'is_physical_person':
                options = [_('no committee'), _('committee')]; // switched order: no committee=physical person
                verboseStateName = 'committee';
                break;
        }
        const content = this.translate.instant(`Set status for selected participants:`);

        const selectedChoice = await this.choiceService.open(content, null, false, options);
        if (selectedChoice) {
            const value = selectedChoice.action === options[0];
            this.repo.bulkSetStateTemporary(this.selectedRows, field, value).catch(this.raiseError);
        }
    }

    /**
     * Handler for bulk sending e-mail invitations. Uses selectedRows defined via
     * multiSelect mode.
     */
    public async sendInvitationEmailSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to send emails to all selected participants?');
        const content = this.selectedRows.length + ' ' + this.translate.instant('emails');
        if (await this.promptService.open(title, content)) {
            this.repo.bulkSendInvitationEmail(this.selectedRows).catch(this.raiseError);
        }
    }

    /**
     * Get information about the last time an invitation email was sent to a user
     *
     * @param user
     * @returns a string representation about the last time an email was sent to a user
     */
    public getEmailSentTime(user: ViewUser): string {
        if (!user.isLastEmailSend) {
            return this.translate.instant('No email sent');
        }
        return this.repo.lastSentEmailTimeString(user);
    }

    /**
     * Handler for bulk resetting passwords to the default ones. Needs multiSelect mode.
     */
    public async resetPasswordsToDefaultSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to reset all passwords to the default ones?');
        if (!(await this.promptService.open(title))) {
            return;
        }

        if (this.selectedRows.find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    'Note: Your own password was not changed. Please use the password change dialog instead.'
                )
            );
        }
        this.repo.bulkResetPasswordsToDefaultTemporary(this.selectedRows).catch(this.raiseError);
    }

    /**
     * Handler for bulk generating new passwords. Needs multiSelect mode.
     */
    public async generateNewPasswordsPasswordsSelected(): Promise<void> {
        const title = this.translate.instant(
            'Are you sure you want to generate new passwords for all selected participants?'
        );
        const content = this.translate.instant(
            'Note, that the default password will be changed to the new generated one.'
        );
        if (!(await this.promptService.open(title, content))) {
            return;
        }

        if (this.selectedRows.find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    'Note: Your own password was not changed. Please use the password change dialog instead.'
                )
            );
        }
        const rows = this.selectedRows.filter(row => row.user.id !== this.operator.operatorId);
        this.repo.bulkGenerateNewPasswordsTemporary(rows);
    }

    /**
     * Sets the user present
     *
     * @param viewUser the viewUser Object
     * @param event the mouse event (to prevent propagaton to row triggers)
     */
    public setPresent(viewUser: ViewUser): void {
        const isAllowed =
            this.operator.hasPerms(Permission.usersCanManage) ||
            (this.allowSelfSetPresent && this.operator.operatorId === viewUser.id);
        if (isAllowed) {
            this.repo.setPresent(viewUser, !this.isUserPresent(viewUser));
        }
    }
}
