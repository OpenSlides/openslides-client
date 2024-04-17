import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ViewUser } from '../../../../../site/pages/meetings/view-models/view-user';
import { OperatorService } from '../../../../../site/services/operator.service';
import { PasswordForm } from '../../definitions';

@Component({
    selector: `os-user-password-form`,
    templateUrl: `./user-password-form.component.html`,
    styleUrls: [`./user-password-form.component.scss`]
})
export class UserPasswordFormComponent implements OnInit, OnDestroy {
    @Input()
    public canUpdate = false;

    @Input()
    public user: ViewUser | null = null;

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
    public adminPasswordForm: UntypedFormGroup;

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

    public constructor(private operator: OperatorService, private fb: UntypedFormBuilder) {
        this.adminPasswordForm = this.createForm();
    }

    public ngOnInit(): void {
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
        if (event.key === `Enter` && event.shiftKey) {
            this.save.emit();
        }
    }

    /**
     * Takes generated password and puts it into admin PW field
     * and displays it
     */
    public generatePassword(): void {
        const randomPassword = this.generatePasswordFn ? this.generatePasswordFn() : ``;
        this.adminPasswordForm.patchValue({
            newPassword: randomPassword
        });
        this.hidePassword = false;
    }

    private createForm(): UntypedFormGroup {
        return this.fb.group({
            newPassword: [``, Validators.required]
        });
    }
}
