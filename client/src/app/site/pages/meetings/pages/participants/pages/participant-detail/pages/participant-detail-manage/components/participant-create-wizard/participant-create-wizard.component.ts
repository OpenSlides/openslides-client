import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { User } from 'src/app/domain/models/users/user';
import { SearchUsersPresenterService } from 'src/app/gateways/presenter/search-users-presenter.service';
import { OneOfValidator } from 'src/app/site/modules/user-components';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { UserService } from 'src/app/site/services/user.service';

import { GroupControllerService } from '../../../../../../modules/groups/services/group-controller.service';
import { getParticipantMinimalSubscriptionConfig } from '../../../../../../participants.subscription';
import { MEETING_RELATED_FORM_CONTROLS } from '../../../../../../services/common/participant-controller.service/participant-controller.service';

@Component({
    selector: `os-participant-create-wizard`,
    templateUrl: `./participant-create-wizard.component.html`,
    styleUrls: [`./participant-create-wizard.component.scss`]
})
export class ParticipantCreateWizardComponent extends BaseMeetingComponent implements OnInit {
    @ViewChild(MatStepper)
    private readonly _stepper!: MatStepper;

    public participantSubscriptionConfig = getParticipantMinimalSubscriptionConfig(this.activeMeetingId);

    public readonly additionalFormControls = MEETING_RELATED_FORM_CONTROLS.mapToObject(controlName => ({
        [controlName]: [``]
    }));

    public get randomPasswordFn(): (() => string) | null {
        return this._accountId ? null : () => this.repo.getRandomPassword();
    }

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.userService.isAllowed(permission, this.isOwnPage);
    }

    public get patchFormValueFn(): (controlName: string, user?: ViewUser) => any | null {
        return (controlName, user) => {
            if (controlName === `is_present`) {
                return user ? user.isPresentInMeeting() : true;
            }
            return null;
        };
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canManageUsers = this.isAllowedFn(`manage`);
            if (canManageUsers) {
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

    public get currentStepIndexObservable(): Observable<number> {
        return this._currentStepIndexSubject.asObservable();
    }

    public get isNewUser(): boolean {
        return this._isNewUser;
    }

    public get isOwnPage(): boolean {
        return this._isOwnPage;
    }

    public get showVoteWeight(): boolean {
        const isVoteWeightEnabled = this._isElectronicVotingEnabled && this._isVoteWeightEnabled;
        return this.user ? isVoteWeightEnabled && typeof this.user.vote_weight() === `number` : isVoteWeightEnabled;
    }

    public get showVoteDelegations(): boolean {
        return this._isVoteDelegationEnabled;
    }

    private get user(): ViewUser | null {
        return this._currentUser;
    }

    private readonly _currentStepIndexSubject = new BehaviorSubject<number>(0);

    private _isNewUser = false;
    private _isOwnPage = false;
    private _isUserInScope = false;
    private _isVoteWeightEnabled = false;
    private _isVoteDelegationEnabled = false;
    private _isElectronicVotingEnabled = false;

    private _accountId: Id | null = null;
    private _suitableAccountList: Partial<User>[] = [];

    private _currentUser: ViewUser | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        fb: UntypedFormBuilder,
        public readonly repo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private userService: UserService,
        private presenter: SearchUsersPresenterService,
        private organizationSettingsService: OrganizationSettingsService
    ) {
        super(componentServiceCollector, translate);
        this.createUserForm = fb.group(
            {
                username: [``],
                first_name: [``],
                last_name: [``],
                email: [``]
            },
            {
                validators: [OneOfValidator.validation([`username`, `first_name`, `last_name`, `email`], `name`)]
            }
        );
    }

    public ngOnInit(): void {
        // TODO: Fetch groups for repo search selection
        this.groupsObservable = this.groupRepo.getViewModelListWithoutDefaultGroupObservable();

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

    public onAccountSelected(account: Partial<User>): void {
        this.createUserForm.patchValue(account);
        this._accountId = account.id || null;
        this._stepper.next();
        this.checkScope();
    }

    public getSaveAction(): () => Promise<void> {
        this.checkFields(this.personalInfoFormValue);
        return async () => {
            if (this._accountId) {
                this.repo
                    .update(this.personalInfoFormValue, {
                        ...this.personalInfoFormValue,
                        id: this._accountId
                    })
                    .resolve();
            } else {
                this.repo.create(this.personalInfoFormValue);
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
            this._isUserInScope = await this.userService.isUserInSameScope(this._accountId);
        }
    }
}
