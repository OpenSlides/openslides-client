import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import {
    MEETING_RELATED_FORM_CONTROLS,
    ParticipantControllerService
} from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { getCommitteeListMinimalSubscriptionConfig } from 'src/app/site/pages/organization/pages/committees/committees.subscription';
import { CommitteeSortService } from 'src/app/site/pages/organization/pages/committees/pages/committee-list/services/committee-list-sort.service/committee-sort.service';
import { CommitteeControllerService } from 'src/app/site/pages/organization/pages/committees/services/committee-controller.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserService } from 'src/app/site/services/user.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

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
    selector: `os-participant-detail-edit`,
    templateUrl: `./participant-detail-edit.component.html`,
    styleUrls: [`./participant-detail-edit.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ParticipantDetailEditComponent extends BaseMeetingComponent implements OnInit {
    @ViewChild(UserDetailViewComponent)
    private userDetailView;

    public participantSubscriptionConfig = getParticipantMinimalSubscriptionConfig(this.activeMeetingId);
    public committeeSubscriptionConfig = getCommitteeListMinimalSubscriptionConfig();

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
        locked_out: [``],
        external: [``],
        home_committee_id: [``]
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
            if (this._isUserEditable && controlName !== `default_password`) {
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

    private _disableExpandControl = false;

    public get disableExpandControl(): boolean {
        return this._disableExpandControl;
    }

    public set disableExpandControl(delegationLongEnough: boolean) {
        this._disableExpandControl = delegationLongEnough;
    }

    public isFormValid = false;
    public personalInfoFormValue: any = {};
    public formErrors: Record<string, boolean> | null = null;

    /**
     * if this is the own page
     */
    public ownPage = false;

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

    public get canManageHomeCommittee(): boolean {
        return this.user?.home_committee_id
            ? this.operator.hasCommitteePermissions(this.user?.home_committee_id, CML.can_manage)
            : this.operator.hasOrganizationPermissions(OML.can_manage_users);
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
        public readonly committeeController: CommitteeControllerService,
        public readonly committeeSortService: CommitteeSortService,
        private operator: OperatorService,
        private promptService: PromptService,
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

    public async ngOnInit(): Promise<void> {
        await this.setEditMode();
    }

    public isAllowed(action: string): boolean {
        return this.userService.isAllowed(action, this.ownPage);
    }

    private getUserByUrl(): void {
        this.subscriptions.push(
            combineLatest([this.route.params, this.activeMeetingIdService.meetingIdObservable]).subscribe(
                async ([params, _]) => {
                    if (params[`id`]) {
                        this._userId = +params[`id`];
                    }
                    if (this._userId) {
                        await this.updateEditable();
                        await this.loadUserById();
                    }
                }
            )
        );
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

    public async setEditMode(): Promise<void> {
        await this.modelRequestService.waitSubscriptionReady(PARTICIPANT_DETAIL_SUBSCRIPTION);
        setTimeout(() => (this._userFormLoaded = true), 1000);
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
            await this.updateUser();
        } catch (e) {
            this.raiseError(e);
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
        this.router.navigate([`../`], { relativeTo: this.route });
    }

    public onCancel(): void {
        this.router.navigate([`../`], { relativeTo: this.route });
    }

    public getTransformSetHomeCommitteeFn(): (value?: string[]) => Id {
        return () => (this.user ? this.user.home_committee_id : null);
    }

    public getTransformPropagateFn(): (value?: Id[]) => any {
        return value => value;
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

    private checkSelectedGroupsCanManage(): boolean {
        return this.usersGroups.some(group => group.hasPermission(Permission.userCanManage));
    }

    private async updateEditable(): Promise<void> {
        const allowedFields = await this.userService.isEditable(this._userId, [`first_name`, `default_password`]);
        this._isUserEditable = allowedFields.includes(`first_name`);
        this._isDefaultPasswordEditable = allowedFields.includes(`default_password`);
    }
}
