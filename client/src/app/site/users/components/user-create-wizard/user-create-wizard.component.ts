import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { SearchUsersByNameOrEmailPresenterService } from 'app/core/core-services/presenters/search-users-by-name-or-email-presenter.service';
import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MEETING_RELATED_FORM_CONTROLS, PERSONAL_FORM_CONTROLS, UserService } from 'app/core/ui-services/user.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { User } from 'app/shared/models/users/user';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseComponent } from 'app/site/base/components/base.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { GroupRepositoryService } from '../../../../core/repositories/users/group-repository.service';
import { ViewMeeting } from '../../../../management/models/view-meeting';
import { ViewGroup } from '../../models/view-group';

@Component({
    selector: `os-user-create-wizard`,
    templateUrl: `./user-create-wizard.component.html`,
    styleUrls: [`./user-create-wizard.component.scss`]
})
export class UserCreateWizardComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild(MatStepper)
    private readonly _stepper: MatStepper;

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
        };
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canManageUsers = this.isAllowedFn(`manage`);
            if (canManageUsers) {
                if (this._isUserInScope || (this._newUser && !this._accountId)) {
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

    public readonly createUserForm: FormGroup;

    public isFormValid = false;

    public personalInfoFormValue: any = {};
    public formErrors: { [name: string]: boolean } | null = null;

    public get currentStepIndexObservable(): Observable<number> {
        return this._currentStepIndexSubject.asObservable();
    }

    public get isNewUser(): boolean {
        return this._newUser;
    }

    public get isOwnPage(): boolean {
        return this._ownPage;
    }

    public get groupsObservable(): Observable<ViewGroup[]> {
        return this.groupRepo.getViewModelListObservableWithoutDefaultGroup();
    }

    private readonly _currentStepIndexSubject = new BehaviorSubject<number>(0);
    private _newUser = false;
    private _ownPage = false;
    private _isUserInScope = false;
    private _formHasChanged = false;

    private _accountId: Id | null = null;
    private _suitableAccountList: Partial<User>[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        fb: FormBuilder,
        private repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private presenter: SearchUsersByNameOrEmailPresenterService
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
                validators: [OneOfValidator.validation([`username`, `first_name`, `last_name`], `name`)]
            }
        );
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(this.createUserForm.valueChanges.subscribe(() => (this._formHasChanged = true)));
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === `new`) {
            super.setTitle(`New participant`);
            this._newUser = true;
        }
    }

    public goToStep(index: number): void {
        this._currentStepIndexSubject.next(index);
    }

    public async onStepChanged(event: StepperSelectionEvent): Promise<void> {
        if (event.selectedIndex === this.CHOOSE_PARTICIPANT_STEP) {
            this.onChooseAccount();
        }
        if (event.selectedIndex === this.CREATE_PARTICIPANT_STEP && !!this._accountId) {
            this.checkScope();
        }
        this._currentStepIndexSubject.next(event.selectedIndex);
        this._formHasChanged = false;
    }

    public async onChooseAccount(): Promise<void> {
        if (this._formHasChanged) {
            const { username, first_name, last_name, email } = this.createUserForm.value;
            const _username = username ? username : `${first_name} ${last_name}`;
            const result = await this.presenter.call({
                searchCriteria: [{ username: _username, email }]
            });
            this._suitableAccountList = Object.keys(result).flatMap(key => result[key]);
            if (this._suitableAccountList.length === 0) {
                this.goToStep(this.CREATE_PARTICIPANT_STEP);
            } else {
                this.goToStep(this.CHOOSE_PARTICIPANT_STEP);
            }
        }
        this._formHasChanged = false;
    }

    public onAccountSelected(account: Partial<User>): void {
        this.createUserForm.patchValue(account);
        this._accountId = account.id || null;
        this._formHasChanged = false;
        this._stepper.next();
        this.checkScope();
    }

    public getSaveAction(): () => Promise<Identifiable | void> {
        this.checkFields(this.personalInfoFormValue);
        return async () => {
            if (this._accountId) {
                await this.repo
                    .update(this.personalInfoFormValue, {
                        ...this.personalInfoFormValue,
                        id: this._accountId
                    })
                    .resolve();
            } else {
                await this.repo.create(this.personalInfoFormValue);
            }
            this.onCancel();
        };
    }

    public onCancel(): void {
        this.router.navigate([`/`, this.activeMeetingId, `users`]);
    }

    protected getModelRequest(): SimplifiedModelRequest | null {
        return {
            ids: [this.activeMeetingId],
            viewModelCtor: ViewMeeting,
            fieldset: [],
            follow: [`group_ids`]
        };
    }

    private checkFields(user: any): void {
        if (!user) {
            user = { group_ids: [] };
        }
        if (!user.group_ids?.length) {
            const defaultGroupId = this.activeMeetingService.meeting.default_group_id;
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
