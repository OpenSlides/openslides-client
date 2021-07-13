import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { genders } from 'app/shared/models/users/user';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-user-detail-view',
    templateUrl: './user-detail-view.component.html',
    styleUrls: ['./user-detail-view.component.scss']
})
export class UserDetailViewComponent extends BaseComponent {
    /**
     * Reference to the edit template content.
     */
    @ContentChild('editView', { read: TemplateRef, static: true })
    public editView: TemplateRef<any>;

    /**
     * Reference to the show template content.
     */
    @ContentChild('showView', { read: TemplateRef, static: true })
    public showView: TemplateRef<any>;

    /**
     * Reference to the edit template for checks.
     */
    @ContentChild('moreChecks', { read: TemplateRef, static: true })
    public moreChecks: TemplateRef<any>;

    /**
     * Reference to the show template for icons.
     */
    @ContentChild('moreIcons', { read: TemplateRef, static: true })
    public moreIcons: TemplateRef<any>;

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

    private _user: ViewUser;

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
    public isAllowedFn: (permission: string) => boolean;

    @Input()
    public generatePasswordFn: () => string;

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

    private _isEditing = false;

    private _additionalValidators: ValidatorFn[] = [];
    private _additionalFormControls: any = {};
    private _formValueChangeSubscription: Subscription | null = null;

    public constructor(
        serviceCollector: ComponentServiceCollector,
        operator: OperatorService,
        private fb: FormBuilder
    ) {
        super(serviceCollector);
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
        if (event.key === 'Enter' && event.shiftKey) {
            this.submitEvent.emit();
        }
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
        this._formValueChangeSubscription = this.personalInfoForm.valueChanges.subscribe(() => this.propagateValues());
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
            if (typeof this.user[ctrl] === 'function') {
                personalInfoPatch[ctrl] = this.user[ctrl]();
            } else {
                personalInfoPatch[ctrl] = this.user[ctrl];
            }
        });
        this.personalInfoForm.patchValue(personalInfoPatch);
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
        if (!this.isAllowed('manage')) {
            formControlNames.forEach(formControlName => {
                if (!['username', 'email'].includes(formControlName)) {
                    this.personalInfoForm.get(formControlName).disable();
                }
            });
        }
    }

    /**
     * initialize the form with default values
     */
    private createForm(): void {
        this.personalInfoForm = this.fb.group(
            {
                username: ['', this.isNewUser ? [] : [Validators.required]],
                title: [''],
                first_name: [''],
                last_name: [''],
                gender: [''],
                email: [''],
                last_email_send: [''],
                default_password: [''],
                is_active: [true],
                is_physical_person: [true],
                ...this._additionalFormControls
            },
            {
                validators: [
                    OneOfValidator.validation(['username', 'first_name', 'last_name'], 'name'),
                    ...this._additionalValidators
                ]
            }
        );
    }

    private propagateValues(): void {
        setTimeout(() => {
            // setTimeout prevents 'ExpressionChangedAfterItHasBeenChecked'-error
            this.changeEvent.emit(this.personalInfoForm.value);
            this.validEvent.emit(this.personalInfoForm.valid);
            this.errorEvent.emit(this.personalInfoForm.errors);
        });
    }
}
