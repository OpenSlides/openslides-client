import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { createEmailValidator } from 'src/app/infrastructure/utils/validators/email';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

@Component({
    selector: `os-reset-password`,
    templateUrl: `./reset-password.component.html`,
    styleUrls: [`./reset-password.component.scss`]
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
    /**
     * THis form holds one control for the email.
     */
    public resetPasswordForm: UntypedFormGroup;

    public get isWaiting(): boolean {
        return this._isWaiting;
    }

    private _isWaiting = false;

    /**
     * Constructur for the reset password view. Initializes the form for the email.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        formBuilder: UntypedFormBuilder,
        private userRepo: UserControllerService
    ) {
        super();
        this.resetPasswordForm = formBuilder.group({
            email: [``, [Validators.required, createEmailValidator()]]
        });
    }

    /**
     * sets the title of the page
     */
    public ngOnInit(): void {
        super.setTitle(`Reset password`);
    }

    /**
     * Do the password reset.
     */
    public async resetPassword(): Promise<void> {
        if (this.resetPasswordForm.invalid) {
            return;
        }

        try {
            this._isWaiting = true;
            await this.userRepo.forgetPassword(this.resetPasswordForm.get(`email`)!.value);
            this._isWaiting = false;
            this.matSnackBar.open(
                this.translate.instant(`An email with a password reset link has been sent.`),
                this.translate.instant(`OK`),
                {
                    duration: 0
                }
            );
            this.router.navigate([`/login`]);
        } catch (e) {
            this._isWaiting = false;
            this.raiseError(e);
        }
    }
}
