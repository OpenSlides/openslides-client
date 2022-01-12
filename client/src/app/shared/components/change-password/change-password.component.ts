import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PasswordValidator } from 'app/shared/validators';
import { BaseComponent } from 'app/site/base/components/base.component';

export interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

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
    selector: `os-change-password`,
    templateUrl: `./change-password.component.html`,
    styleUrls: [`./change-password.component.scss`]
})
export class ChangePasswordComponent extends BaseComponent implements OnInit {
    @Output()
    public changeEvent = new EventEmitter<PasswordForm>();

    @Output()
    public validEvent = new EventEmitter<boolean>();

    public changePasswordForm: FormGroup;
    public newPasswordForm: FormControl;

    public hideOldPassword = true;
    public hideNewPassword = true;
    public hideConfirmPassword = true;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        private fb: FormBuilder
    ) {
        super(componentServiceCollector, translate);
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
