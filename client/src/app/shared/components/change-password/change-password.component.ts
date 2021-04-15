import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PasswordValidator } from 'app/shared/validators';
import { BaseComponent } from 'app/site/base/components/base.component';

export interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

@Component({
    selector: 'os-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
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

    public constructor(serviceCollector: ComponentServiceCollector, private fb: FormBuilder) {
        super(serviceCollector);
    }

    public ngOnInit(): void {
        this.newPasswordForm = this.fb.control('', Validators.required);
        this.changePasswordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: this.newPasswordForm,
            confirmPassword: ['', [Validators.required, PasswordValidator.validation(this.newPasswordForm)]]
        });
        this.subscriptions.push(
            this.changePasswordForm.valueChanges.subscribe(value => {
                this.changeEvent.emit(value);
                this.validEvent.emit(this.changePasswordForm.valid);
            })
        );
    }
}
