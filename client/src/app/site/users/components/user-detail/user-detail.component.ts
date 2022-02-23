import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpecificStructuredField } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { GetUserScopePresenterService } from 'app/core/core-services/presenters/get-user-scope-presenter.service';
import { Id } from 'app/core/definitions/key-types';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { PollService } from 'app/site/polls/services/poll.service';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { MemberService } from '../../../../core/core-services/member.service';
import { PERSONAL_FORM_CONTROLS, UserService } from '../../../../core/ui-services/user.service';
import { ViewGroup } from '../../models/view-group';
import { ViewUser } from '../../models/view-user';
import { UserPdfExportService } from '../../services/user-pdf-export.service';

const MEETING_RELATED_FORM_CONTROLS = [
    `structure_level`,
    `number`,
    `vote_weight`,
    `about_me`,
    `comment`,
    `group_ids`,
    `vote_delegations_from_ids`,
    `vote_delegated_to_id`,
    `is_present`
];

/**
 * Users detail component for both new and existing users
 */
@Component({
    selector: `os-user-detail`,
    templateUrl: `./user-detail.component.html`,
    styleUrls: [`./user-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent extends BaseModelContextComponent implements OnDestroy {
    public readonly additionalFormControls = MEETING_RELATED_FORM_CONTROLS.mapToObject(controlName => ({
        [controlName]: [``]
    }));

    public get randomPasswordFn(): () => string {
        return () => this.getRandomPassword();
    }

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.isAllowed(permission);
    }

    public get patchFormValueFn(): (controlName: string, user?: ViewUser) => any | null {
        return (controlName, user) => {
            if (controlName === `is_present`) {
                return user ? user.isPresentInMeeting() : true;
            }
        };
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canManageUsers = this.isAllowed(`manage`);
            if (canManageUsers) {
                if (this._isUserInScope || this.newUser) {
                    return true;
                } else {
                    return MEETING_RELATED_FORM_CONTROLS.includes(controlName);
                }
            } else {
                return PERSONAL_FORM_CONTROLS.includes(controlName);
            }
        };
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
    public readonly isEditingSubject = new BehaviorSubject<boolean>(false);

    /**
     * True if a new user is created
     */
    public newUser = false;

    /**
     * ViewUser model
     */
    public user: ViewUser | null = null;

    public get usersGroups(): ViewGroup[] {
        return this.user.groups();
    }

    /**
     * Contains all groups, except for the default group.
     */
    public readonly groups: BehaviorSubject<ViewGroup[]> = new BehaviorSubject<ViewGroup[]>([]);

    public readonly users: BehaviorSubject<ViewUser[]> = new BehaviorSubject<ViewUser[]>([]);

    public get showVoteWeight(): boolean {
            return (
            this.pollService.isElectronicVotingEnabled &&
            this._voteWeightEnabled &&
            typeof this.user.vote_weight() === `number`
        );
    }

    private _userId: Id = undefined; // Not initialized
    private _voteWeightEnabled: boolean;
    private _isUserInScope: boolean;

    /**
     * Constructor for user
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        public repo: UserRepositoryService,
        private operator: OperatorService,
        private promptService: PromptService,
        private pdfService: UserPdfExportService,
        private groupRepo: GroupRepositoryService,
        private pollService: PollService,
        private meetingSettingsService: MeetingSettingsService,
        private userService: UserService,
        private memberService: MemberService,
        private presenter: GetUserScopePresenterService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
        this.getUserByUrl();

        this.meetingSettingsService
            .get(`users_enable_vote_weight`)
            .subscribe(enabled => (this._voteWeightEnabled = enabled));

        this.groupRepo.getViewModelListObservableWithoutDefaultGroup().subscribe(this.groups);
        this.users = this.repo.getViewModelListBehaviorSubject();
    }

    public isAllowed(action: string): boolean {
        return this.userService.isAllowed(action, this.ownPage);
    }

    private getUserByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === `new`) {
            super.setTitle(`New participant`);
            this.newUser = true;
            this.setEditMode(true);
        } else {
            this.subscriptions.push(
                combineLatest([this.route.params, this.activeMeetingIdService.meetingIdObservable]).subscribe(
                    async ([params, _]) => {
                        if (params.id) {
                            this._userId = +params.id;
                        }
                        if (this._userId) {
                            await this.loadUserById();
                        }
                    }
                )
            );
        }
    }

    private async loadUserById(): Promise<void> {
        const meetingId = this.activeMeetingId;
        if (meetingId) {
            await this.subscribe({
                viewModelCtor: ViewUser,
                ids: [this._userId],
                follow: [
                    {
                        idField: SpecificStructuredField(
                            `group_$_ids`,
                            this.activeMeetingIdService?.meetingId.toString()
                        )
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
                            templateValue: this.activeMeetingId?.toString()
                        }
                    }
                ]
            });
        }

        this.subscriptions.push(
            this.repo.getViewModelObservable(this._userId).subscribe(user => {
                if (user) {
                    const title = user.getTitle();
                    super.setTitle(title);
                    this.user = user;
                    this.cd.markForCheck();
                }
            }),
            this.operator.operatorUpdatedEvent.subscribe(
                async () => (this._isUserInScope = await this.userService.isUserInSameScope(this._userId))
            )
        );
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
        if (event.key === `Enter` && event.shiftKey) {
            this.saveUser();
        }
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.saveUser();
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
            await this.createOrUpdateUser();
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
        if (!this.hasSubscription(`edit subscription`)) {
            await this.subscribe(
                {
                    viewModelCtor: ViewMeeting,
                    ids: [this.activeMeetingId],
                    follow: [`group_ids`, { idField: `user_ids`, fieldset: `shortName` }]
                },
                `edit subscription`
            );
        }

        if (!this.newUser && edit) {
            this._isUserInScope = await this.userService.isUserInSameScope(this._userId);
        }

        this.isEditingSubject.next(edit);

        // case: abort creation of a new user
        if (this.newUser && !edit) {
            this.goToAllUsers();
        }
    }

    /**
     * click on the delete user button
     */
    public async deleteUserButton(): Promise<void> {
        if (await this.memberService.doDeleteOrRemove({ toDelete: [this.user], toRemove: [] })) {
            this.goToAllUsers();
        }
    }

    /**
     * navigate to the change Password site
     */
    public changePassword(): void {
        this.router.navigate([this.activeMeetingId, `users`, `password`, this.user.id]);
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
        const title = this.translate.instant(`Sending an invitation email`);
        const content = this.translate.instant(`Are you sure you want to send an invitation email to the user?`);
        if (await this.promptService.open(title, content)) {
            this.repo.sendInvitationEmails([this.user]).then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Fetches a localized string for the time the last email was sent.
     *
     * @returns a translated string with either the localized date/time; of 'No email sent'
     */
    public getEmailSentTime(): string {
        if (!this.user.isLastEmailSend) {
            return this.translate.instant(`No email sent`);
        }
        return this.repo.lastSentEmailTimeString(this.user);
    }

    private async createUser(): Promise<void> {
        const partialUser = { ...this.personalInfoFormValue };

        if (partialUser.is_present) {
            partialUser.is_present_in_meeting_ids = [this.activeMeetingId];
        }
        this.checkForGroups(partialUser);

        await this.repo.create(partialUser);
        this.goToAllUsers();
    }

    private async updateUser(): Promise<void> {
        if (this.operator.hasPerms(Permission.userCanManage)) {
            this.checkForGroups(this.personalInfoFormValue);
            await this.repo.update(this.personalInfoFormValue, this.user);
        } else {
            await this.repo.updateSelf(this.personalInfoFormValue, this.user);
        }
        this.setEditMode(false);
    }

    private checkForGroups(user: any): void {
        if (!user?.group_ids.length) {
            const defaultGroupId = this.activeMeetingService.meeting.default_group_id;
            user.group_ids = [defaultGroupId];
        }
    }

    private checkFormForErrors(): void {
        let hint = ``;
        if (this.formErrors) {
            hint = `At least one of username, first name or last name has to be set.`;
        }
        this.raiseError(this.translate.instant(hint));
    }

    private goToAllUsers(): void {
        this.router.navigate([this.activeMeetingId, `users`]);
    }
}
