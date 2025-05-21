import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef
} from '@angular/core';
import {
    AbstractControl,
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map, OperatorFunction, Subscription } from 'rxjs';
import { createEmailValidator } from 'src/app/infrastructure/utils/validators/email';
import { getGenderListSubscriptionConfig } from 'src/app/site/pages/organization/pages/accounts/pages/gender/gender.subscription';
import { GenderControllerService } from 'src/app/site/pages/organization/pages/accounts/pages/gender/services/gender-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ViewUser } from '../../../../../site/pages/meetings/view-models/view-user';
import { OneOfValidator } from '../../validators';

@Component({
    selector: `os-user-detail-view`,
    templateUrl: `./user-detail-view.component.html`,
    styleUrls: [`./user-detail-view.component.scss`],
    standalone: false
})
export class UserDetailViewComponent extends BaseUiComponent implements OnInit, AfterViewInit {
    /**
     * Reference to the edit template content.
     */
    @ContentChild(`editView`, { read: TemplateRef, static: true })
    public editView: TemplateRef<any> | null = null;

    /**
     * Reference to the show template content.
     */
    @ContentChildren(`showView`, { read: TemplateRef })
    public showView: QueryList<TemplateRef<any> | null> = null;

    @Input()
    public set user(user: ViewUser | null) {
        const oldUser = this._user;
        this._user = user;
        if (!oldUser) {
            this.prepareForm();
        } else if (this.selfUpdateEnabled) {
            this.performSelfUpdate();
        }
    }

    public get user(): ViewUser | null {
        return this._user;
    }

    @Input()
    public isNewUser = false;

    @Input()
    public set isEditing(is: boolean) {
        this._isEditing = is;
        if (is) {
            this.enterEditMode();
        }
    }

    public get isEditing(): boolean {
        return this._isEditing;
    }

    @Input()
    public useMatcard = true;

    @Input()
    public useBottomMargin = true;

    @Input()
    public useAdditionalEditTemplate = true;

    @Input()
    public set additionalFormControls(controls: any) {
        this._additionalFormControls = controls;
        this.prepareForm();
    }

    @Input()
    public set additionalValidators(validators: ValidatorFn | ValidatorFn[]) {
        if (!Array.isArray(validators)) {
            validators = [validators];
        }
        this._additionalValidators = validators;
        this.prepareForm();
    }

    @Input()
    public isAccountSelfUpdate = false;

    @Input()
    public patchFormValueFn: (controlName: string, user?: ViewUser) => any | null = () => {};

    @Input()
    public isAllowedFn: (permission: string) => boolean = () => true;

    @Input()
    public generatePasswordFn: (() => string) | null | undefined;

    @Input()
    public shouldEnableFormControlFn: (controlName: string) => boolean = () => true;

    @Output()
    public changeEvent = new EventEmitter();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    @Output()
    public errorEvent = new EventEmitter<Record<string, boolean> | null>();

    @Output()
    public submitEvent = new EventEmitter<void>();

    public personalInfoForm!: UntypedFormGroup;

    public get isSelf(): boolean {
        return this.operator.operatorId === this._user?.id;
    }

    public genderListSubscriptionConfig = getGenderListSubscriptionConfig();

    public genderPipeFn: OperatorFunction<any, any> = map(items => {
        const newItems = items.map(item => {
            item.getTitle = (): string => this.translate.instant(item.name);
            return item;
        });
        return newItems;
    });

    private set _initialState(state: any | null) {
        this._initialStateString = JSON.stringify(state);
    }

    private get _initialState(): string | null {
        return this._initialStateString;
    }

    private _isEditing = false;
    private _hasChanges = false;
    private _initialStateString: string | null = null;

    private _user: ViewUser | null = null;
    private _additionalValidators: ValidatorFn[] = [];
    private _additionalFormControls: any = {};
    private _formValueChangeSubscription: Subscription | null = null;

    private _checkIfDeletedProperties = [`pronoun`, `default_password`];

    private selfUpdateEnabled = false;

    public constructor(
        private fb: UntypedFormBuilder,
        private operator: OperatorService,
        public genderRepo: GenderControllerService,
        private cd: ChangeDetectorRef,
        private translate: TranslateService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.operator.operatorUpdated.subscribe(() =>
                this.updateFormControlsAccessibility(this.shouldEnableFormControlFn)
            )
        );
    }

    public ngAfterViewInit(): void {
        this.updateFormControlsAccessibility(this.shouldEnableFormControlFn);
        this.cd.detectChanges();
    }

    public isAllowed(permission: string): boolean {
        return this.isAllowedFn(permission);
    }

    public setRandomPassword(): void {
        if (this.generatePasswordFn) {
            this.personalInfoForm.patchValue({
                default_password: this.generatePasswordFn()
            });
        }
    }

    public onKeyDown(_event: KeyboardEvent): void {}

    public markAsPristine(): void {
        this._initialState = this.personalInfoForm.value;
        this._hasChanges = false;
    }

    public resetEditMode(): void {
        this.enterEditMode();
    }

    public enableSelfUpdate(isEnabled = true): void {
        this.selfUpdateEnabled = isEnabled;
    }

    private enterEditMode(): void {
        this.prepareForm();
        this.updateFormControlsAccessibility(this.shouldEnableFormControlFn);
        if (this.user) {
            this.patchFormValues();
        }
    }

    private prepareForm(): void {
        this.createForm();
        this.patchFormValues();
        this.preparePropagation();
    }

    private preparePropagation(): void {
        if (this._formValueChangeSubscription) {
            this._formValueChangeSubscription.unsubscribe();
            this._formValueChangeSubscription = null;
        }
        this._formValueChangeSubscription = this.personalInfoForm.valueChanges.subscribe(nextValue => {
            this._hasChanges = JSON.stringify(nextValue) !== this._initialState;
            this.propagateValues();
        });
        this.propagateValues();
    }

    /**
     * Updates the formcontrols of the `personalInfoForm` with the values from a given user.
     */
    private patchFormValues(): void {
        if (!this.user) {
            return;
        }
        const personalInfoPatch: any = {};
        Object.keys(this.personalInfoForm.controls).forEach(ctrl => {
            personalInfoPatch[ctrl] = this.getFormValuePatch(ctrl as keyof ViewUser);
        });
        const isActiveExists = typeof this.user?.is_active === `boolean` || this.user?.id;
        const isPersonExists = typeof this.user?.is_physical_person === `boolean` || this.user?.id;
        this.personalInfoForm.patchValue(
            {
                ...personalInfoPatch,
                ...(isActiveExists ? {} : { is_active: true }),
                ...(isPersonExists ? {} : { is_physical_person: true })
            },
            { emitEvent: false }
        );
        this._initialState = personalInfoPatch;
    }

    private performSelfUpdate(): void {
        const config = this.getCreateFormControlsConfig();
        const personalInfoPatch: any = {};
        Object.keys(this.personalInfoForm.controls).forEach(ctrl => {
            personalInfoPatch[ctrl] = this.user[ctrl] ?? config[ctrl][0];
        });
        this.personalInfoForm.patchValue(personalInfoPatch);
        this._initialState = personalInfoPatch;
        this.updateFormControlsAccessibility(this.shouldEnableFormControlFn);
    }

    private getFormValuePatch(controlName: keyof ViewUser): any {
        let patchValue = this.patchFormValueFn(controlName, this.user!);
        if (!patchValue) {
            const userValue = this.user![controlName] as () => unknown | string;
            patchValue = typeof userValue === `function` ? userValue.call(this.user) : userValue;
        }
        return patchValue;
    }

    /**
     * Makes the form editable
     */
    private updateFormControlsAccessibility(fn: (controlName: string) => boolean): void {
        const formControlNames = Object.keys(this.personalInfoForm.controls);

        formControlNames.forEach(formControlName => {
            if (fn(formControlName)) {
                this.personalInfoForm.get(formControlName).enable();
            } else {
                this.personalInfoForm.get(formControlName).disable();
            }
        });
    }

    /**
     * initialize the form with default values
     */
    private createForm(): void {
        this.personalInfoForm = this.fb.group(this.getCreateFormControlsConfig(), {
            validators: [
                OneOfValidator.validation([`username`, `first_name`, `last_name`], `name`),
                ...this._additionalValidators
            ]
        });
    }

    private getCreateFormControlsConfig(): Record<string, any> {
        return {
            username: [``, this.isNewUser ? [this.noSpaceValidator()] : [Validators.required, this.noSpaceValidator()]],
            pronoun: [``, Validators.maxLength(32)],
            title: [``],
            first_name: [``],
            last_name: [``],
            gender_id: [``],
            email: [``, [createEmailValidator()]],
            last_email_sent: [``],
            default_password: [``],
            member_number: [``],
            is_active: [true],
            is_physical_person: [true],
            ...this._additionalFormControls
        };
    }

    private propagateValues(): void {
        setTimeout(() => {
            // setTimeout prevents 'ExpressionChangedAfterItHasBeenChecked'-error
            const changes = this.getChangedValues(this.personalInfoForm.value);
            this.changeEvent.emit(changes);
            this.validEvent.emit(this.personalInfoForm.valid && (this.isNewUser || this._hasChanges));
            this.errorEvent.emit(this.personalInfoForm.errors);
        });
    }

    private noSpaceValidator(): ValidationErrors | null {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value || (this.user?.id && control.pristine)) {
                return null;
            }

            const noSpace = value.indexOf(` `) === -1;
            if (!noSpace) {
                return { noSpace: `Username may not contain spaces` };
            }
            return null;
        };
    }

    private getChangedValues(formData: Record<string, any>): Record<string, any> {
        const data = this.useAdditionalEditTemplate
            ? formData
            : Object.keys(formData).mapToObject(key =>
                    Object.keys(this._additionalFormControls ?? {}).includes(key) ? {} : { [key]: formData[key] }
                );
        const newData = {};
        if (this.user) {
            Object.keys(data).forEach(key => {
                newData[key] =
                    this._checkIfDeletedProperties.includes(key) && !data[key] && !!this.user[key] ? null : data[key];
                if (newData[key] !== null) {
                    this.personalInfoForm.get(key).markAsTouched();
                }
            });
            if (this.user.id) {
                for (const key of Object.keys(newData)) {
                    if (this.personalInfoForm.get(key).pristine) {
                        delete newData[key];
                    }
                }
            }
            if (this.user.saml_id && newData[`default_password`]) {
                delete newData[`default_password`];
            }
            return newData;
        }
        return data;
    }
}
