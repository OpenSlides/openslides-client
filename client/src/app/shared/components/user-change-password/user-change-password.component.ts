import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ViewUser } from 'app/site/users/models/view-user';
import { PasswordForm } from '../change-password/change-password.component';

@Component({
    selector: 'os-user-change-password',
    templateUrl: './user-change-password.component.html',
    styleUrls: ['./user-change-password.component.scss']
})
export class UserChangePasswordComponent implements OnInit, OnDestroy {
    @Input()
    public canManage = false;

    @Input()
    public user?: ViewUser;

    @Input()
    public generatePasswordFn?: () => string;

    @Output()
    public save = new EventEmitter<void>();

    @Output()
    public valueChanged = new EventEmitter<PasswordForm | string>();

    @Output()
    public validStateChanged = new EventEmitter<boolean>();

    public get isOwnPage(): boolean {
        return this.operator.operatorId === this.user?.id;
    }

    /**
     * formGroup for the admin user
     */
    public adminPasswordForm: FormGroup;

    /**
     * Value of the formGroup for a user.
     */
    public set userPasswordForm(form: PasswordForm) {
        this.valueChanged.emit(form);
    }

    /**
     * If the value of a new password for a user is valid.
     */
    public set isUserPasswordValid(is: boolean) {
        this.validStateChanged.emit(is);
    }

    /**
     * if all password inputs is hidden
     */
    public hidePassword = true;

    /**
     * if the old password should be shown
     */
    public hideOldPassword = true;

    private passwordFormSubscription: Subscription | null = null;

    public constructor(private operator: OperatorService, private fb: FormBuilder) {}

    public ngOnInit(): void {
        this.adminPasswordForm = this.fb.group({
            newPassword: ['', Validators.required]
        });
        this.passwordFormSubscription = this.adminPasswordForm.valueChanges.subscribe(value => {
            this.valueChanged.emit(value.newPassword);
            this.validStateChanged.emit(this.adminPasswordForm.valid);
        });
    }

    public ngOnDestroy(): void {
        if (this.passwordFormSubscription) {
            this.passwordFormSubscription.unsubscribe();
            this.passwordFormSubscription = null;
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.save.emit();
        }
    }

    /**
     * Takes generated password and puts it into admin PW field
     * and displays it
     */
    public generatePassword(): void {
        const randomPassword = this.generatePasswordFn ? this.generatePasswordFn() : '';
        this.adminPasswordForm.patchValue({
            newPassword: randomPassword
        });
        this.hidePassword = false;
    }
}
