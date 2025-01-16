import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { User } from 'src/app/domain/models/users/user';
import { SearchUsersPresenterService } from 'src/app/gateways/presenter/search-users-presenter.service';
import { createEmailValidator } from 'src/app/infrastructure/utils/validators/email';
import { OneOfValidator, UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { UserService } from 'src/app/site/services/user.service';

import { GroupControllerService } from '../../../../../../modules/groups/services/group-controller.service';
import {
    getParticipantDetailSubscription,
    getParticipantMinimalSubscriptionConfig
} from '../../../../../../participants.subscription';
import { MEETING_RELATED_FORM_CONTROLS } from '../../../../../../services/common/participant-controller.service/participant-controller.service';
import { ParticipantListSortService } from '../../../../../participant-list/services/participant-list-sort/participant-list-sort.service';
import { StructureLevelControllerService } from '../../../../../structure-levels/services/structure-level-controller.service';
import { ViewStructureLevel } from '../../../../../structure-levels/view-models';

@Component({
    selector: `os-participant-create-wizard`,
    templateUrl: `./participant-create-wizard.component.html`,
    styleUrls: [`./participant-create-wizard.component.scss`]
})
export class ParticipantCreateWizardComponent extends BaseMeetingComponent implements OnInit {
    @ViewChild(MatStepper)
    private readonly _stepper!: MatStepper;

    @ViewChild(UserDetailViewComponent)
    private detailView: UserDetailViewComponent;

    private account: User = null;

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

    public get randomPasswordFn(): (() => string) | null {
        return this._accountId ? null : (): string => this.repo.getRandomPassword();
    }

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.userService.isAllowed(permission, this.isOwnPage);
    }

    public get patchFormValueFn(): (controlName: string, user?: ViewUser) => any | null {
        return (controlName, user) => {
            if (controlName === `is_present`) {
                return user?.isPresentInMeeting ? user.isPresentInMeeting() : false;
            }
            return null;
        };
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canUpdateUsers = this.isAllowedFn(`update`);
            if (canUpdateUsers) {
                if (this._isUserInScope || (this._isNewUser && !this._accountId)) {
                    return true;
                } else {
                    return MEETING_RELATED_FORM_CONTROLS.includes(controlName);
                }
            } else {
                return PERSONAL_FORM_CONTROLS.includes(controlName);
            }
        };
    }

    public get suitableAccountList(): Partial<User>[] {
        return this._suitableAccountList;
    }

    public readonly FILL_FORM_PARTICIPANT_STEP = 0;
    private readonly CHOOSE_PARTICIPANT_STEP = 1;
    public readonly CREATE_PARTICIPANT_STEP = 2;

    public readonly createUserForm: UntypedFormGroup;

    public isFormValid = false;

    public personalInfoFormValue: any = {};
    public formErrors: { [name: string]: boolean } | null = null;
    public groupsObservable: Observable<ViewGroup[]> | null = null;

    /**
     * Contains all structure levels.
     */
    public structureLevelObservable: Observable<ViewStructureLevel[]>;

    public get currentStepIndexObservable(): Observable<number> {
        return this._currentStepIndexSubject;
    }

    public get isNewUser(): boolean {
        return this._isNewUser;
    }

    public get isOwnPage(): boolean {
        return this._isOwnPage;
    }

    public get showVoteWeight(): boolean {
        const isVoteWeightEnabled = this._isElectronicVotingEnabled && this._isVoteWeightEnabled;
        return isVoteWeightEnabled;
    }

    public get showVoteDelegations(): boolean {
        return this._isVoteDelegationEnabled;
    }

    public get user(): ViewUser | null {
        return this.account ?? this.createUserForm.value;
    }

    public get flicker(): Observable<boolean> {
        return this.flickerSubject;
    }

    public get isVoteWeightError(): boolean {
        return this.personalInfoFormValue.vote_weight < 0.000001;
    }

    public flickerSubject = new BehaviorSubject<boolean>(false);

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup): number => groupA.weight - groupB.weight;

    private readonly _currentStepIndexSubject = new BehaviorSubject<number>(0);

    private _isNewUser = false;
    private _isOwnPage = false;
    private _isUserInScope = false;
    private _isVoteWeightEnabled = false;
    private _isVoteDelegationEnabled = false;
    private _isElectronicVotingEnabled = false;

    private _accountId: Id | null = null;
    private _suitableAccountList: Partial<User>[] = [];

    public constructor(
        protected override translate: TranslateService,
        fb: UntypedFormBuilder,
        public readonly repo: ParticipantControllerService,
        public readonly sortService: ParticipantListSortService,
        private groupRepo: GroupControllerService,
        private userService: UserService,
        private structureLevelRepo: StructureLevelControllerService,
        private presenter: SearchUsersPresenterService,
        private organizationSettingsService: OrganizationSettingsService
    ) {
        super();
        this.createUserForm = fb.group(
            {
                username: [``],
                first_name: [``],
                last_name: [``],
                member_number: [``],
                email: [``, createEmailValidator()]
            },
            {
                validators: [OneOfValidator.validation([`username`, `first_name`, `last_name`, `email`], `name`)]
            }
        );
        this.createUserForm.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (this._accountId) {
                this.detailView?.enableSelfUpdate();
                this.account = null;
                this._accountId = null;
                this._isUserInScope = false;
            }
        });
    }

    public ngOnInit(): void {
        // TODO: Fetch groups for repo search selection
        this.groupsObservable = this.groupRepo.getViewModelListWithoutSystemGroupsObservable();

        this.structureLevelObservable = this.structureLevelRepo.getViewModelListObservable();

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
        const urlSegments = this.router.url.split(`/`);
        if (urlSegments.at(-1) === `new`) {
            super.setTitle(`New participant`);
            this._isNewUser = true;
        }
    }

    public goToStep(index: number): void {
        this._currentStepIndexSubject.next(index);
    }

    public onStepChanged(event: StepperSelectionEvent): void {
        if (event.selectedIndex === this.CHOOSE_PARTICIPANT_STEP) {
            this.onChooseAccount(event.previouslySelectedIndex === this.CREATE_PARTICIPANT_STEP);
        }
        if (event.selectedIndex === this.CREATE_PARTICIPANT_STEP && !!this._accountId) {
            this.checkScope();
        }
        this._currentStepIndexSubject.next(event.selectedIndex);
    }

    public async onChooseAccount(reverse = false): Promise<void> {
        const result = await this.presenter.callForUsers({
            permissionRelatedId: this.activeMeetingId!,
            users: [this.createUserForm.value]
        });
        this._suitableAccountList = result[0];
        if (this._suitableAccountList.length === 0) {
            this.goToStep(reverse ? this.FILL_FORM_PARTICIPANT_STEP : this.CREATE_PARTICIPANT_STEP);
        } else {
            this.goToStep(this.CHOOSE_PARTICIPANT_STEP);
        }
    }

    public async onAccountSelected(account: Partial<User>): Promise<void> {
        this.detailView?.enableSelfUpdate(false);
        this.flickerSubject.next(true);
        const shouldReset = !!this.detailView;
        this.createUserForm.patchValue(account, { emitEvent: false });
        this._accountId = account.id || null;
        this._stepper.next();
        await this.checkScope();
        if (shouldReset || this._isUserInScope) {
            this.detailView.resetEditMode();
        }
        if (this.account) {
            this.detailView.personalInfoForm.patchValue(this.account);
        }
        this.flickerSubject.next(false);
    }

    public getSaveAction(): () => Promise<void> {
        this.checkFields(this.personalInfoFormValue);
        return async () => {
            const payload = {
                ...this.personalInfoFormValue,
                vote_delegated_to_id: this.personalInfoFormValue.vote_delegated_to_id
                    ? this.repo.getViewModel(this.personalInfoFormValue.vote_delegated_to_id).getMeetingUser().id
                    : undefined,
                vote_delegations_from_ids: this.personalInfoFormValue.vote_delegations_from_ids
                    ? this.personalInfoFormValue.vote_delegations_from_ids
                          .map((id: Id) => this.repo.getViewModel(id).getMeetingUser().id)
                          .filter((id: Id | undefined) => !!id)
                    : []
            };
            if (payload.gender_id === 0) {
                payload.gender_id = null;
            }
            if (this._accountId) {
                this.repo
                    .update(payload, {
                        ...payload,
                        id: this._accountId
                    })
                    .resolve();
                if (this.personalInfoFormValue.is_present) {
                    this.repo.setPresent(true, { ...payload, id: this._accountId }).resolve();
                }
            } else {
                this.repo.create(payload);
            }
            this.onCancel();
        };
    }

    public onCancel(): void {
        this.router.navigate([`/`, this.activeMeetingId, `participants`]);
    }

    private checkFields(user: any): void {
        if (!user) {
            user = { group_ids: [] };
        }
        if (!user.group_ids?.length) {
            const defaultGroupId = this.activeMeetingService.meeting!.default_group_id;
            user.group_ids = [defaultGroupId];
        }
        if (user.is_present) {
            user.is_present_in_meeting_ids = [this.activeMeetingId];
        }
    }

    private async checkScope(): Promise<void> {
        if (this._accountId) {
            this._isUserInScope = await this.userService.hasScopeManagePerms(this._accountId);
            if (this._isUserInScope && this.account?.id !== this._accountId) {
                this.account = new User(
                    (await this.modelRequestService.fetch(getParticipantDetailSubscription(this._accountId)))[`user`][
                        this._accountId
                    ] as Partial<User>
                );
            } else if (!this._isUserInScope) {
                this.account = null;
            }
        }
    }

    public get isLockedOutAndCanManage(): boolean {
        const lockedOutHelper = this.personalInfoFormValue?.locked_out ?? this.user?.is_locked_out;
        return lockedOutHelper && this.checkSelectedGroupsCanManage();
    }

    public get lockoutCheckboxDisabled(): boolean {
        const notChanged = (this.personalInfoFormValue?.locked_out ?? null) === null;
        const isLockedOut = this.user?.is_locked_out;
        return notChanged && !isLockedOut && this.checkSelectedGroupsCanManage();
    }

    public updateByValueChange(event: any): void {
        this.personalInfoFormValue = event;
        if (this.detailView.personalInfoForm.get(`locked_out`).disabled !== this.lockoutCheckboxDisabled) {
            if (this.lockoutCheckboxDisabled) {
                this.detailView.personalInfoForm.get(`locked_out`).disable();
            } else {
                this.detailView.personalInfoForm.get(`locked_out`).enable();
            }
        }
    }

    private checkSelectedGroupsCanManage(): boolean {
        return (this.detailView.personalInfoForm.get(`group_ids`).value ?? [])
            .map((id: Id): ViewGroup => this.groupRepo.getViewModel(id))
            .some(group => group.hasPermission(Permission.userCanManage));
    }
}
