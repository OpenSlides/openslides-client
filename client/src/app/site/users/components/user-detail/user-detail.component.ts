import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, combineLatest } from 'rxjs';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SpecificStructuredField } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { PollService } from 'app/site/polls/services/poll.service';
import { UserPdfExportService } from '../../services/user-pdf-export.service';
import { ViewGroup } from '../../models/view-group';
import { ViewUser } from '../../models/view-user';

/**
 * Users detail component for both new and existing users
 */
@Component({
    selector: 'os-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent extends BaseModelContextComponent implements OnDestroy {
    public readonly additionalFormControls = {
        structure_level: [''],
        number: [''],
        vote_weight: [],
        about_me: [''],
        comment: [''],
        group_ids: [[]],
        vote_delegations_from_ids: [[]],
        vote_delegated_to_id: [''],
        is_present: [true]
    };

    public get randomPasswordFn(): () => string {
        return () => this.getRandomPassword();
    }

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.isAllowed(permission);
    }

    public isFormValid = false;
    public personalInfoFormValue: any = {};
    public formErrors: { [name: string]: boolean } | null = null;

    /**
     * if this is the own page
     */
    public ownPage = false;

    /**
     * Editing a user
     */
    public editUser = false;

    /**
     * True if a new user is created
     */
    public newUser = false;

    /**
     * True if the operator has manage permissions
     */
    public canManage = false;

    /**
     * ViewUser model
     */
    public user: ViewUser;

    public get usersGroups(): ViewGroup[] {
        return this.user.groups();
    }

    /**
     * Contains all groups, except for the default group.
     */
    public readonly groups: BehaviorSubject<ViewGroup[]> = new BehaviorSubject<ViewGroup[]>([]);

    public readonly users: BehaviorSubject<ViewUser[]> = new BehaviorSubject<ViewUser[]>([]);

    private voteWeightEnabled: boolean;

    public get showVoteWeight(): boolean {
        return this.pollService.isElectronicVotingEnabled && this.voteWeightEnabled;
    }

    private userId: Id = undefined; // Not initialized

    /**
     * Constructor for user
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private router: Router,
        public repo: UserRepositoryService,
        private operator: OperatorService,
        private promptService: PromptService,
        private pdfService: UserPdfExportService,
        private groupRepo: GroupRepositoryService,
        private pollService: PollService,
        private meetingSettingsService: MeetingSettingsService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);
        this.getUserByUrl();

        this.meetingSettingsService
            .get('users_enable_vote_weight')
            .subscribe(enabled => (this.voteWeightEnabled = enabled));

        this.groupRepo.getViewModelListObservableWithoutDefaultGroup().subscribe(this.groups);
        this.users = this.repo.getViewModelListBehaviorSubject();
    }

    private getUserByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'new') {
            super.setTitle('New participant');
            this.newUser = true;
            this.setEditMode(true);
        } else {
            this.subscriptions.push(
                combineLatest([this.route.params, this.activeMeetingIdService.meetingIdObservable]).subscribe(
                    async ([params, _]) => {
                        if (params.id) {
                            this.userId = +params.id;
                        }
                        if (this.userId) {
                            await this.loadUserById();
                        }
                    }
                )
            );
        }
    }

    private async loadUserById(): Promise<void> {
        const meetingId = this.activeMeetingIdService.meetingId;
        if (meetingId) {
            await this.requestModels({
                viewModelCtor: ViewUser,
                ids: [this.userId],
                follow: [
                    {
                        idField: SpecificStructuredField(
                            'group_$_ids',
                            this.activeMeetingIdService?.meetingId.toString()
                        )
                    },
                    {
                        idField: {
                            templateIdField: 'vote_delegations_$_from_ids',
                            templateValue: this.activeMeetingId.toString()
                        }
                    },
                    {
                        idField: {
                            templateIdField: 'vote_delegated_$_to_id',
                            templateValue: this.activeMeetingId?.toString()
                        }
                    }
                ]
            });
        }

        this.subscriptions.push(
            this.repo.getViewModelObservable(this.userId).subscribe(user => {
                if (user) {
                    const title = user.getTitle();
                    super.setTitle(title);
                    this.user = user;
                }
            }),
            this.operator.operatorUpdatedEvent.subscribe(() => {
                this.ownPage = this.operator.operatorId === this.userId;
            })
        );
    }

    /**
     * Should determine if the user (Operator) has the
     * correct permission to perform the given action.
     *
     * actions might be:
     * - delete         (deleting the user) (users.can_manage and not ownPage)
     * - seeName        (title, first, last, gender, about) (user.can_see_name or ownPage)
     * - seeOtherUsers  (title, first, last, gender, about) (user.can_see_name)
     * - seeExtra       (email, comment, is_active, last_email_send) (user.can_see_extra_data)
     * - seePersonal    (mail, username, structure level) (user.can_see_extra_data or ownPage)
     * - manage         (everything) (user.can_manage)
     * - changePersonal (mail, username, about) (user.can_manage or ownPage)
     * - changePassword (user.can_change_password)
     *
     * @param action the action the user tries to perform
     */
    public isAllowed(action: string): boolean {
        switch (action) {
            case 'delete':
                return this.operator.hasPerms(Permission.userCanManage) && !this.ownPage;
            case 'manage':
                return this.operator.hasPerms(Permission.userCanManage);
            case 'seeName':
                return this.operator.hasPerms(Permission.userCanSee, Permission.userCanManage) || this.ownPage;
            case 'seeOtherUsers':
                return this.operator.hasPerms(Permission.userCanSee, Permission.userCanManage);
            case 'seeExtra':
                return this.operator.hasPerms(Permission.userCanSeeExtraData, Permission.userCanManage);
            case 'seePersonal':
                return this.operator.hasPerms(Permission.userCanSeeExtraData, Permission.userCanManage) || this.ownPage;
            case 'changePersonal':
                return this.operator.hasPerms(Permission.userCanManage) || this.ownPage;
            case 'changePassword':
                return (
                    (this.ownPage && this.operator.canChangeOwnPassword) ||
                    this.operator.hasPerms(Permission.userCanManage)
                );
            default:
                return false;
        }
    }

    public getRandomPassword(): string {
        return this.repo.getRandomPassword();
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.saveUser();
        }
    }

    /**
     * Save / Submit a user
     */
    public async saveUser(): Promise<void> {
        if (!this.isFormValid) {
            this.checkFormForErrors();
            return;
        }

        try {
            this.createOrUpdateUser();
        } catch (e) {
            this.raiseError(e);
        }
    }

    private async createOrUpdateUser(): Promise<void> {
        if (this.newUser) {
            await this.createUser();
        } else {
            await this.updateUser();
        }
    }

    /**
     * sets editUser variable and editable form
     * @param edit
     */
    public async setEditMode(edit: boolean): Promise<void> {
        if (!this.hasSubscription('edit subscription')) {
            await this.requestModels(
                {
                    viewModelCtor: ViewMeeting,
                    ids: [this.activeMeetingIdService.meetingId],
                    follow: ['group_ids', { idField: 'user_ids', fieldset: 'shortName' }]
                },
                'edit subscription'
            );
        }

        this.editUser = edit;

        // case: abort creation of a new user
        if (this.newUser && !edit) {
            this.goToAllUsers();
        }
    }

    /**
     * click on the delete user button
     */
    public async deleteUserButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this participant?');
        const content = this.user.full_name;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.user);
            this.goToAllUsers();
        }
    }

    /**
     * navigate to the change Password site
     */
    public changePassword(): void {
        this.router.navigate([this.activeMeetingId, 'users', 'password', this.user.id]);
    }

    /**
     * Triggers the pdf download for this user
     */
    public onDownloadPdf(): void {
        this.pdfService.exportSingleUserAccessPDF(this.user);
    }

    /**
     * (Re)- send an invitation email for this user after confirmation
     */
    public async sendInvitationEmail(): Promise<void> {
        const title = this.translate.instant('Sending an invitation email');
        const content = this.translate.instant('Are you sure you want to send an invitation email to the user?');
        if (await this.promptService.open(title, content)) {
            this.repo.bulkSendInvitationEmail([this.user]).then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Fetches a localized string for the time the last email was sent.
     *
     * @returns a translated string with either the localized date/time; of 'No email sent'
     */
    public getEmailSentTime(): string {
        if (!this.user.isLastEmailSend) {
            return this.translate.instant('No email sent');
        }
        return this.repo.lastSentEmailTimeString(this.user);
    }

    private async createUser(): Promise<void> {
        const partialUser = { ...this.personalInfoFormValue };
        if (partialUser.is_present) {
            partialUser.is_present_in_meeting_ids = [this.activeMeetingId];
        }
        await this.repo.create(partialUser);
        this.goToAllUsers();
    }

    private async updateUser(): Promise<void> {
        await this.repo.update(this.personalInfoFormValue, this.user);
        this.setEditMode(false);
    }

    private checkFormForErrors(): void {
        let hint = '';
        if (this.formErrors) {
            hint = 'At least one of username, first name or last name has to be set.';
        }
        this.raiseError(this.translate.instant(hint));
    }

    private goToAllUsers(): void {
        this.router.navigate([this.activeMeetingId, 'users']);
    }
}
