import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { genders } from 'app/shared/models/users/user';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Subscription } from 'rxjs';

@Component({
    selector: `os-user-detail-view`,
    templateUrl: `./user-detail-view.component.html`,
    styleUrls: [`./user-detail-view.component.scss`]
})
export class UserDetailViewComponent extends BaseComponent {
    /**
     * Reference to the edit template content.
     */
    @ContentChild(`editView`, { read: TemplateRef, static: true })
    public editView: TemplateRef<any>;

    /**
     * Reference to the show template content.
     */
    @ContentChild(`showView`, { read: TemplateRef, static: true })
    public showView: TemplateRef<any>;

    @Input()
    public set user(user: ViewUser) {
        const oldUser = this._user;
        this._user = user;
        if (!oldUser) {
            this.prepareForm();
        }
    }

    public get user(): ViewUser {
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
    public patchFormValueFn: (controlName: string, user?: ViewUser) => any | null = () => {};

    @Input()
    public isAllowedFn: (permission: string) => boolean;

    @Input()
    public generatePasswordFn: () => string;

    @Input()
    public shouldEnableFormControlFn: (controlName: string) => boolean = () => true;

    @Output()
    public changeEvent = new EventEmitter();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    @Output()
    public errorEvent = new EventEmitter<{ [name: string]: boolean } | null>();

    @Output()
    public submitEvent = new EventEmitter<void>();

    public personalInfoForm: FormGroup;

    public genders = genders;

    private set _initialState(state: any | null) {
        this._initialStateString = JSON.stringify(state);
    }

    private get _initialState(): string | null {
        return this._initialStateString;
    }

    private _isEditing = false;
    private _hasChanges = false;
    private _initialStateString: string | null = null;

    private _user: ViewUser;
    private _additionalValidators: ValidatorFn[] = [];
    private _additionalFormControls: any = {};
    private _formValueChangeSubscription: Subscription | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        operator: OperatorService,
        private fb: FormBuilder
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(operator.operatorUpdatedEvent.subscribe(() => this.updateFormControlsAccessibility()));
    }

    public isAllowed(permission: string): boolean {
        return this.isAllowedFn ? this.isAllowedFn(permission) : true;
    }

    public setRandomPassword(): void {
        if (this.generatePasswordFn) {
            this.personalInfoForm.patchValue({
                default_password: this.generatePasswordFn()
            });
        }
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.submitEvent.emit();
        }
    }

    public markAsPristine(): void {
        this._initialState = this.personalInfoForm.value;
        this._hasChanges = false;
    }

    private enterEditMode(): void {
        this.prepareForm();
        this.updateFormControlsAccessibility();
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
        const personalInfoPatch = {};
        Object.keys(this.personalInfoForm.controls).forEach(ctrl => {
            personalInfoPatch[ctrl] = this.getFormValuePatch(ctrl);
        });
        this.personalInfoForm.patchValue(personalInfoPatch, { emitEvent: false });
        this._initialState = personalInfoPatch;
    }

    private getFormValuePatch(controlName: string): any {
        let patchValue = this.patchFormValueFn(controlName, this.user);
        if (!patchValue) {
            const userValue = this.user[controlName];
            patchValue = typeof userValue === `function` ? userValue.call(this.user) : userValue;
        }
        return patchValue;
    }

    /**
     * Makes the form editable
     */
    private updateFormControlsAccessibility(): void {
        const formControlNames = Object.keys(this.personalInfoForm.controls);

        // Enable all controls.
        formControlNames.forEach(formControlName => {
            this.personalInfoForm.get(formControlName).enable();
        });

        // Disable not permitted controls
        formControlNames.forEach(formControlName => {
            if (!this.shouldEnableFormControlFn(formControlName)) {
                this.personalInfoForm.get(formControlName).disable();
            }
        });
    }

    /**
     * initialize the form with default values
     */
    private createForm(): void {
        this.personalInfoForm = this.fb.group(
            {
                username: [``, this.isNewUser ? [] : [Validators.required]],
                pronoun: [``],
                title: [``],
                first_name: [``],
                last_name: [``],
                gender: [``],
                email: [``],
                last_email_send: [``],
                default_password: [``],
                is_active: [true],
                is_physical_person: [true],
                ...this._additionalFormControls
            },
            {
                validators: [
                    OneOfValidator.validation([`username`, `first_name`, `last_name`], `name`),
                    ...this._additionalValidators
                ]
            }
        );
    }

    private propagateValues(): void {
        setTimeout(() => {
            // setTimeout prevents 'ExpressionChangedAfterItHasBeenChecked'-error
            this.changeEvent.emit(this.personalInfoForm.value);
            this.validEvent.emit(this.personalInfoForm.valid && this._hasChanges);
            this.errorEvent.emit(this.personalInfoForm.errors);
        });
    }
}
