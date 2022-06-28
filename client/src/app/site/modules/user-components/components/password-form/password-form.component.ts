import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { PasswordForm } from '../../definitions';
import { PasswordValidator } from '../../validators';

const UndesiredPasswords = [
    `123456`,
    `123456789`,
    `password`,
    `passwort`,
    `adobe 123`,
    `12345678`,
    `qwerty`,
    `qwertz`,
    `111111`,
    `123123`
];
const UndesiredPasswordFeedback = `ಠ_ಠ`;

@Component({
    selector: `os-password-form`,
    templateUrl: `./password-form.component.html`,
    styleUrls: [`./password-form.component.scss`]
})
export class PasswordFormComponent extends BaseUiComponent implements OnInit {
    @Output()
    public changeEvent = new EventEmitter<PasswordForm>();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    public changePasswordForm!: UntypedFormGroup;
    public newPasswordForm!: UntypedFormControl;

    public hideOldPassword = true;
    public hideNewPassword = true;
    public hideConfirmPassword = true;

    public constructor(private fb: UntypedFormBuilder) {
        super();
    }

    public ngOnInit(): void {
        this.newPasswordForm = this.fb.control(``, Validators.required);
        this.changePasswordForm = this.fb.group({
            oldPassword: [``, Validators.required],
            newPassword: this.newPasswordForm,
            confirmPassword: [``, [Validators.required, PasswordValidator.validation(this.newPasswordForm)]]
        });
        this.subscriptions.push(
            this.changePasswordForm.valueChanges.subscribe(value => this.evaluatePasswordField(value))
        );
    }

    public reset(): void {
        this.changePasswordForm.reset();
    }

    private evaluatePasswordField(value: PasswordForm): void {
        this.changeEvent.emit(value);
        this.validEvent.emit(this.changePasswordForm.valid);

        if (value.confirmPassword === value.newPassword && UndesiredPasswords.includes(value.newPassword)) {
            this.raiseWarning(UndesiredPasswordFeedback);
        }
    }
}
