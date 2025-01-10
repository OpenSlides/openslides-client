import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import {
    MEETING_RELATED_FORM_CONTROLS,
    ParticipantControllerService
} from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserService } from 'src/app/site/services/user.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ParticipantPdfExportService } from '../../../../export/participant-pdf-export.service';
import { GroupControllerService } from '../../../../modules';
import {
    getParticipantMinimalSubscriptionConfig,
    PARTICIPANT_DETAIL_SUBSCRIPTION
} from '../../../../participants.subscription';
import { areGroupsDiminished } from '../../../participant-list/components/participant-list/participant-list.component';
import { ParticipantListSortService } from '../../../participant-list/services/participant-list-sort/participant-list-sort.service';
import { StructureLevelControllerService } from '../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../structure-levels/view-models';

@Component({
    selector: `os-participant-detail-view`,
    templateUrl: `./participant-detail-view.component.html`,
    styleUrls: [`./participant-detail-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantDetailViewComponent extends BaseMeetingComponent {
    @ViewChild(UserDetailViewComponent)
    private userDetailView;

    public participantSubscriptionConfig = getParticipantMinimalSubscriptionConfig(this.activeMeetingId);

    public readonly additionalFormControls = {
        structure_level_ids: [``],
        number: [``],
        vote_weight: [``, Validators.min(0.000001)],
        about_me: [``],
        comment: [``],
        group_ids: [``],
        vote_delegations_from_ids: [``],
        vote_delegated_to_id: [``],
        is_present: [``],
        locked_out: [``]
    };

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    public get randomPasswordFn(): () => string {
        return () => this.getRandomPassword();
    }

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.isAllowed(permission);
    }

    public get patchFormValueFn(): (controlName: string, user?: ViewUser) => any | null {
        return (controlName, user) => {
            if (controlName === `is_present` && user) {
                return user.isPresentInMeeting();
            }
            if (controlName === `locked_out` && user) {
                return user.isLockedOutOfMeeting();
            }
            const value = user?.[controlName as keyof ViewUser] || null;
            return typeof value === `function` ? value.bind(user)(this.activeMeetingId!) : value;
        };
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canUpdateUsers = this.isAllowed(`update`);
            if (this.newUser && canUpdateUsers) {
                return true;
            } else if (this._isUserEditable && controlName !== `default_password`) {
                return true;
            } else if (this._isDefaultPasswordEditable && controlName === `default_password`) {
                return true;
            } else if (canUpdateUsers) {
                return controlName === `is_present`
                    ? this.operator.hasPerms(Permission.userCanManagePresence)
                    : MEETING_RELATED_FORM_CONTROLS.includes(controlName);
            } else {
                return PERSONAL_FORM_CONTROLS.includes(controlName);
            }
        };
    }

    public get isVoteWeightError(): boolean {
        return this.personalInfoFormValue.vote_weight < 0.000001;
    }

    public get operatorHasEqualOrHigherOML(): boolean {
        const userOML = this.user?.organization_management_level;
        return userOML ? this.operator.hasOrganizationPermissions(userOML as OML) : true;
    }

    private _disableExpandControl: boolean = false;

    public get disableExpandControl(): boolean {
        return this._disableExpandControl;
    }

    public set disableExpandControl(delegationLongEnough: boolean) {
        this._disableExpandControl = delegationLongEnough;
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
        if (!this.activeMeetingId) {
            return [];
        }
        return this.user?.groups() || [];
    }

    public get usersStructureLevels(): ViewStructureLevel[] {
        if (!this.activeMeetingId) {
            return [];
        }
        return this.user?.structure_levels() || [];
    }

    public get usersStructureLevelIds(): number[] {
        if (!this.activeMeetingId) {
            return [];
        }
        return this.user?.structure_level_ids() || [];
    }

    /**
     * Contains all structure levels.
     */
    public readonly structureLevelObservable: Observable<ViewStructureLevel[]>;

    /**
     * Contains all groups, except for the default group.
     */
    public readonly groups: Observable<ViewGroup[]>;

    public get showVoteWeight(): boolean {
        const isVoteWeightEnabled = this._isElectronicVotingEnabled && this._isVoteWeightEnabled;
        return this.user ? isVoteWeightEnabled && typeof this.user.vote_weight() === `number` : isVoteWeightEnabled;
    }

    public get showVoteDelegations(): boolean {
        return this._isVoteDelegationEnabled;
    }

    public get saveButtonEnabled(): boolean {
        return this._userFormLoaded && this.isFormValid && !this.isLockedOutAndCanManage;
    }

    public get isLockedOutAndCanManage(): boolean {
        const lockedOutHelper = this.personalInfoFormValue?.locked_out ?? this.user?.is_locked_out;
        return lockedOutHelper && this.checkSelectedGroupsCanManage();
    }

    public get lockoutCheckboxDisabled(): boolean {
        const other = this.user?.id !== this.operator.operatorId;
        const notChanged = (this.personalInfoFormValue?.locked_out ?? null) === null;
        const isLockedOut = this.user?.is_locked_out;
        return notChanged && !isLockedOut && (this.checkSelectedGroupsCanManage() || !other);
    }

    private _userId: Id | undefined = undefined; // Not initialized
    private _userFormLoaded = false;
    private _isVoteWeightEnabled = false;
    private _isVoteDelegationEnabled = false;
    private _isElectronicVotingEnabled = false;
    private _isDefaultPasswordEditable = false;
    private _isUserEditable = false;

    public constructor(
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        public repo: ParticipantControllerService,
        public sortService: ParticipantListSortService,
        private userController: UserControllerService,
        private operator: OperatorService,
        private promptService: PromptService,
        private pdfService: ParticipantPdfExportService,
        private groupRepo: GroupControllerService,
        private structureLevelRepo: StructureLevelControllerService,
        private userService: UserService,
        private cd: ChangeDetectorRef,
        private organizationSettingsService: OrganizationSettingsService
    ) {
        super();
        this.getUserByUrl();

        this.subscriptions.push(
            this.organizationSettingsService
                .get(`enable_electronic_voting`)
                .subscribe(is => (this._isElectronicVotingEnabled = is)),

            this.meetingSettingsService
                .get(`users_enable_vote_weight`)
                .subscribe(enabled => (this._isVoteWeightEnabled = enabled)),

            this.meetingSettingsService
                .get(`users_enable_vote_delegations`)
                .subscribe(enabled => (this._isVoteDelegationEnabled = enabled))
        );

        this.structureLevelObservable = this.structureLevelRepo.getViewModelListObservable();

        // TODO: Open groups subscription
        this.groups = this.groupRepo.getViewModelListWithoutSystemGroupsObservable();
        this.disableExpandControl = this.user?.vote_delegations_from().length < 10;
    }

    public isAllowed(action: string): boolean {
        return this.userService.isAllowed(action, this.ownPage);
    }

    public goToHistory(): void {
        this.router.navigate([this.activeMeetingId!, `history`], { queryParams: { fqid: this.user.fqid } });
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
                        if (params[`id`]) {
                            this._userId = +params[`id`];
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
        this.subscriptions.push(
            this.repo.getViewModelObservable(this._userId!).subscribe(user => {
                if (user) {
                    const title = user.getTitle();
                    super.setTitle(title, true);
                    this.user = user;
                    this.cd.markForCheck();
                }
            })
        );
        this.updateEditable();
    }

    public getRandomPassword(): string {
        return this.repo.getRandomPassword();
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(_event: KeyboardEvent): void {}

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
        this.isEditingSubject.next(edit);

        // case: abort creation of a new user
        if (this.newUser && !edit) {
            this.goToAllUsers();
        }

        if (edit) {
            await this.modelRequestService.waitSubscriptionReady(PARTICIPANT_DETAIL_SUBSCRIPTION);
            setTimeout(() => (this._userFormLoaded = true), 1000);
        } else {
            this._userFormLoaded = false;
        }
    }

    /**
     * click on the delete user button
     */
    public async deleteUserButton(): Promise<void> {
        if (await this.repo.removeUsersFromMeeting([this.user!])) {
            this.goToAllUsers();
        }
    }

    /**
     * navigate to the change Password site
     */
    public changePassword(): void {
        this.router.navigate([this.activeMeetingId, `participants`, `password`, this.user!.id]);
    }

    /**
     * Triggers the pdf download for this user
     */
    public onDownloadPdf(): void {
        this.pdfService.exportAccessDocuments(this.user!);
    }

    /**
     * (Re)- send an invitation email for this user after confirmation
     */
    public async sendInvitationEmail(): Promise<void> {
        const title = _(`Sending an invitation email`);
        const content = _(`Are you sure you want to send an invitation email to the user?`);
        if (await this.promptService.open(title, content)) {
            this.userController
                .sendInvitationEmails([this.user!], this.activeMeetingId)
                .then(this.raiseError, this.raiseError);
        }
    }

    public updateByValueChange(event: any): void {
        this.personalInfoFormValue = event;
        if (this.userDetailView.personalInfoForm.get(`locked_out`).disabled !== this.lockoutCheckboxDisabled) {
            if (this.lockoutCheckboxDisabled) {
                this.userDetailView.personalInfoForm.get(`locked_out`).disable();
            } else {
                this.userDetailView.personalInfoForm.get(`locked_out`).enable();
            }
        }
    }

    private async createUser(): Promise<void> {
        const partialUser = { ...this.personalInfoFormValue };

        if (partialUser.member_number === ``) {
            delete partialUser.member_number;
        }
        if (partialUser.is_present) {
            partialUser.is_present_in_meeting_ids = [this.activeMeetingId];
        }
        this.checkForGroups(partialUser);

        await this.repo.create(partialUser);
        this.goToAllUsers();
    }

    private async updateUser(): Promise<void> {
        if (this.operator.hasPerms(Permission.userCanUpdate)) {
            this.checkForGroups(this.personalInfoFormValue);
            const isPresent = this.personalInfoFormValue.is_present || false;
            if (this.personalInfoFormValue.vote_delegated_to_id === 0) {
                this.personalInfoFormValue.vote_delegated_to_id = null;
            }
            const payload = {
                ...this.personalInfoFormValue,
                vote_delegated_to_id: this.personalInfoFormValue.vote_delegated_to_id
                    ? this.repo.getViewModel(this.personalInfoFormValue.vote_delegated_to_id).getMeetingUser().id
                    : null,
                vote_delegations_from_ids: this.personalInfoFormValue.vote_delegations_from_ids
                    ? this.personalInfoFormValue.vote_delegations_from_ids
                          .map(id => this.repo.getViewModel(id).getMeetingUser().id)
                          .filter(id => !!id)
                    : []
            };
            if (payload.member_number === ``) {
                payload.member_number = null;
            }
            if (payload.gender_id === 0) {
                payload.gender_id = null;
            }
            const title = _(`This action will remove you from one or more groups.`);
            const content = _(
                `This may diminish your ability to do things in this meeting and you may not be able to revert it by youself. Are you sure you want to do this?`
            );
            if (
                !(
                    this.user.id === this.operator.operatorId &&
                    areGroupsDiminished(this.operator.user.group_ids(), payload.group_ids, this.activeMeeting)
                ) ||
                (await this.promptService.open(title, content))
            ) {
                if (
                    this.operator.hasPerms(Permission.userCanManagePresence) &&
                    this.personalInfoFormValue.is_present !== undefined
                ) {
                    await this.repo
                        .update(payload, this.user!)
                        .concat(this.repo.setPresent(isPresent, this.user!))
                        .resolve();
                } else {
                    await this.repo.update(payload, this.user!).resolve();
                }
            }
        } else {
            await this.repo.updateSelf(this.personalInfoFormValue, this.user!);
        }
        this.setEditMode(false);
    }

    private checkForGroups(user: any): void {
        const defaultGroupId = this.activeMeetingService.meeting!.default_group_id;
        if (user?.group_ids.includes(defaultGroupId) && user?.group_ids.length > 1) {
            user.group_ids = user.group_ids.filter(id => id !== defaultGroupId);
        }
        if (!user?.group_ids.length) {
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
        this.router.navigate([this.activeMeetingId, `participants`]);
    }

    private checkSelectedGroupsCanManage(): boolean {
        return this.usersGroups.some(group => group.hasPermission(Permission.userCanManage));
    }

    private async updateEditable(): Promise<void> {
        const allowedFields = await this.userService.isEditable(this._userId, [`first_name`, `default_password`]);
        this._isUserEditable = allowedFields.includes(`first_name`);
        this._isDefaultPasswordEditable = allowedFields.includes(`default_password`);
    }
}
