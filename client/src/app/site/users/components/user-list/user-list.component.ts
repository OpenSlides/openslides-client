import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService, UserStateField } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { genders } from 'app/shared/models/users/user';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { PollService } from 'app/site/polls/services/poll.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../../../core/ui-services/user.service';
import { ViewGroup } from '../../models/view-group';
import { ViewUser } from '../../models/view-user';
import { UserFilterListService } from '../../services/user-filter-list.service';
import { UserPdfExportService } from '../../services/user-pdf-export.service';
import { UserSortListService } from '../../services/user-sort-list.service';

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
    selector: `os-user-list`,
    templateUrl: `./user-list.component.html`,
    styleUrls: [`./user-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    /**
     * The reference to the template.
     */
    @ViewChild(`userInfoDialog`, { static: true })
    private userInfoDialog: TemplateRef<string>;

    /**
     * Declares the dialog for editing.
     */
    public infoDialog: InfoDialog;

    /**
     * All available groups, where the user can be in.
     */
    public groupsObservable: Observable<ViewGroup[]> = this.groupRepo.getViewModelListObservableWithoutDefaultGroup();

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
        return this._presenceViewConfigured && this.operator.hasPerms(Permission.userCanManage);
    }

    private voteWeightEnabled: boolean;

    /**
     * Helper to check for main button permissions
     *
     * @returns true if the user should be able to create users
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    public get canSeeExtra(): boolean {
        return this.operator.hasPerms(Permission.userCanSeeExtraData);
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

    public get isUserInScope(): boolean {
        return this._isUserInScope;
    }

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `short_name`,
            width: `85%`
        },
        {
            prop: `group`,
            minWidth: 200
        },
        {
            prop: `infos`,
            width: this.singleButtonWidth
        },
        {
            prop: `presence`,
            width: `100px`
        }
    ];

    /**
     * Define extra filter properties
     */
    public filterProps = [`full_name`, `groups`, `structure_level`, `number`, `delegationName`];

    private _allowSelfSetPresent: boolean;
    private _isUserInScope = true;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
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
        private userService: UserService,
        private userPdf: UserPdfExportService,
        private dialog: MatDialog,
        private pollService: PollService
    ) {
        super(componentServiceCollector, translate);

        // enable multiSelect for this listView
        this.canMultiSelect = true;
        this.meetingSettingService
            .get(`users_enable_presence_view`)
            .subscribe(state => (this._presenceViewConfigured = state));
        this.meetingSettingService
            .get(`users_enable_vote_weight`)
            .subscribe(enabled => (this.voteWeightEnabled = enabled));
        this.meetingSettingService
            .get(`users_allow_self_set_present`)
            .subscribe(allowed => (this._allowSelfSetPresent = allowed));
    }

    /**
     * Init function
     *
     * sets the title, inits the table, sets sorting and filter options, subscribes
     * to filter/sort services
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`Participants`);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `user_ids`,
                    fieldset: `list`,
                    additionalFields: [`default_password`], // used for PDF
                    follow: [
                        {
                            idField: {
                                templateIdField: `group_$_ids`,
                                templateValue: this.activeMeetingIdService.meetingId?.toString()
                            }
                        },
                        {
                            idField: {
                                templateIdField: `vote_delegations_$_from_ids`,
                                templateValue: this.activeMeetingId.toString()
                            }
                        },
                        {
                            idField: {
                                templateIdField: `vote_delegated_$_to_id`,
                                templateValue: this.activeMeetingIdService.meetingId?.toString()
                            }
                        }
                    ]
                },
                {
                    idField: `group_ids`
                }
            ],
            fieldset: []
        };
    }

    /**
     * Handles the click on the plus button
     */
    public onPlusButton(): void {
        this.router.navigate([`./new`], { relativeTo: this.route });
    }

    /**
     * Filters the default group of a meeting
     *
     * @param user Their groups will be retrieved
     *
     * @returns The groups the given user is assigned to, except the default group of a current meeting
     */
    public getUserGroups(user: ViewUser): ViewGroup[] {
        return user.groups().filter(group => !group.isDefaultGroup);
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
            return !this.operator.hasPerms(Permission.userCanManage);
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
        this._isUserInScope = await this.userService.isUserInScope(user.id);
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

        const dialogRef = this.dialog.open(this.userInfoDialog, { ...infoDialogSettings, data: { user } });

        dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.key === `Enter` && event.shiftKey) {
                dialogRef.close(this.infoDialog);
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.update(result, user);
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
        this.csvExport.export(
            this.dataSource.filteredData,
            [
                { property: `title` },
                { property: `first_name`, label: `Given name` },
                { property: `last_name`, label: `Surname` },
                { property: `structure_level`, label: `Structure level` },
                { property: `number`, label: `Participant number` },
                {
                    label: `groups`,
                    map: user =>
                        user
                            .groups()
                            .map(group => group.name)
                            .join(`,`)
                },
                { property: `comment` },
                { property: `is_active`, label: `Is active` },
                { property: `is_present_in_meetings`, label: `Is present in meeting` },
                { property: `is_physical_person`, label: `Is a natural person` },
                { property: `default_password`, label: `Initial password` },
                { property: `email` },
                { property: `username` },
                { property: `gender` },
                { property: `vote_weight`, label: `Vote weight` }
            ],
            this.translate.instant(`Participants`) + `.csv`
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
     * Opens a dialog and sets the group(s) for all selected users.
     * SelectedRows is only filled with data in multiSelect mode
     */
    public async setGroupSelected(): Promise<void> {
        const content = this.translate.instant(
            `This will add or remove the following groups for all selected participants:`
        );
        const ADD = _(`add group(s)`);
        const REMOVE = _(`remove group(s)`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(content, this.groupsObservable, true, choices);
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.repo.bulkAddGroupsToUsers(this.selectedRows, selectedChoice.items as number[]);
            } else {
                this.repo.bulkRemoveGroupsFromUsers(this.selectedRows, selectedChoice.items as number[]);
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
     * Handler for bulk sending e-mail invitations. Uses selectedRows defined via
     * multiSelect mode.
     */
    public async sendInvitationEmailSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to send emails to all selected participants?`);
        const content = this.selectedRows.length + ` ` + this.translate.instant(`emails`);
        if (await this.promptService.open(title, content)) {
            this.repo.sendInvitationEmails(this.selectedRows).then(this.raiseError, this.raiseError);
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
            return this.translate.instant(`No email sent`);
        }
        return this.repo.lastSentEmailTimeString(user);
    }

    /**
     * Sets the user present
     *
     * @param viewUser the viewUser Object
     * @param event the mouse event (to prevent propagaton to row triggers)
     */
    public setPresent(viewUser: ViewUser): void {
        const isAllowed =
            this.operator.hasPerms(Permission.userCanManage) ||
            (this._allowSelfSetPresent && this.operator.operatorId === viewUser.id);
        if (isAllowed) {
            this.repo.setPresent(!this.isUserPresent(viewUser), viewUser);
        }
    }

    /**
     * Handler for bulk setting/unsetting the 'active' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    private async setStateSelected(field: UserStateField): Promise<void> {
        let options: [string, string];
        switch (field) {
            case `is_active`:
                options = [_(`active`), _(`inactive`)];
                break;
            case `is_present_in_meetings`:
                options = [_(`present`), _(`absent`)];
                break;
            case `is_physical_person`:
                options = [_(`natural person`), _(`no natural person`)];
                break;
        }
        const content = this.translate.instant(`Set status for selected participants:`);

        const selectedChoice = await this.choiceService.open(content, null, false, options);
        if (selectedChoice) {
            const value = selectedChoice.action === options[0];
            if (field === `is_present_in_meetings`) {
                await this.repo.setPresent(value, ...this.selectedRows);
            } else {
                await this.repo.setState(field, value, ...this.selectedRows);
            }
        }
    }
}
