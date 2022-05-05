import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
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
    selector: 'os-password-form',
    templateUrl: './password-form.component.html',
    styleUrls: ['./password-form.component.scss']
})
export class PasswordFormComponent implements OnInit {
    @Output()
    public changeEvent = new EventEmitter<PasswordForm>();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    public changePasswordForm!: FormGroup;
    public newPasswordForm!: FormControl;

    public hideOldPassword = true;
    public hideNewPassword = true;
    public hideConfirmPassword = true;

    private _passwordChangeSubscription: Subscription | null = null;

    public constructor(private fb: FormBuilder) {}

    public ngOnInit(): void {
        this.newPasswordForm = this.fb.control(``, Validators.required);
        this.changePasswordForm = this.fb.group({
            oldPassword: [``, Validators.required],
            newPassword: this.newPasswordForm,
            confirmPassword: [``, [Validators.required, PasswordValidator.validation(this.newPasswordForm)]]
        });
        this._passwordChangeSubscription = this.changePasswordForm.valueChanges.subscribe(value =>
            this.evaluatePasswordField(value)
        );
    }

    public reset(): void {
        this.changePasswordForm.reset();
    }

    private evaluatePasswordField(value: PasswordForm): void {
        this.changeEvent.emit(value);
        this.validEvent.emit(this.changePasswordForm.valid);

        if (value.confirmPassword === value.newPassword && UndesiredPasswords.includes(value.newPassword)) {
            // this.raiseWarning(UndesiredPasswordFeedback);
        }
    }
}
