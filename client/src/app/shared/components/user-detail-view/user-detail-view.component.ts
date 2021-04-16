import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
export class UserDetailViewComponent extends BaseComponent implements OnInit {
    @Input()
    public user: ViewUser;

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
    public isAllowedFn: (permission: string) => boolean;

    @Input()
    public generatePasswordFn: () => string;

    @Output()
    public changeEvent = new EventEmitter();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    public personalInfoForm: FormGroup;

    public genders = genders;

    private _isEditing = false;

    public constructor(serviceCollector: ComponentServiceCollector, private fb: FormBuilder) {
        super(serviceCollector);
        this.createForm();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.personalInfoForm.valueChanges.subscribe(() => this.propagateValues()));
        this.propagateValues();
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

    private enterEditMode(): void {
        this.createForm();
        this.updateFormControlsAccessibility();
        if (this.user) {
            this.patchFormValues();
        }
    }

    /**
     * Updates the formcontrols of the `personalInfoForm` with the values from a given user.
     */
    private patchFormValues(): void {
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
        if (this.personalInfoForm) {
            return;
        }
        this.personalInfoForm = this.fb.group(
            {
                username: [undefined],
                title: [undefined],
                first_name: [undefined],
                last_name: [undefined],
                gender: [undefined],
                email: [undefined, Validators.email],
                last_email_send: [undefined],
                default_password: [undefined],
                is_active: [true],
                is_physical_person: [true]
            },
            {
                validators: OneOfValidator.validation('username', 'first_name', 'last_name')
            }
        );
    }

    private propagateValues(): void {
        this.changeEvent.emit(this.personalInfoForm.value);
        this.validEvent.emit(this.personalInfoForm.valid);
    }
}
