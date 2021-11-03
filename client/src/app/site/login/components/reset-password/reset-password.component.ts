import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from 'app/core/core-services/http.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

import { UserRepositoryService } from '../../../../core/repositories/users/user-repository.service';

/**
 * Reset password component.
 *
 */
@Component({
    selector: `os-reset-password`,
    templateUrl: `./reset-password.component.html`,
    styleUrls: [`../../assets/reset-password-pages.scss`]
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
    /**
     * THis form holds one control for the email.
     */
    public resetPasswordForm: FormGroup;

    /**
     * Constructur for the reset password view. Initializes the form for the email.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private http: HttpService,
        formBuilder: FormBuilder,
        private router: Router,
        private userRepo: UserRepositoryService
    ) {
        super(componentServiceCollector, translate);
        this.resetPasswordForm = formBuilder.group({
            email: [``, [Validators.required, Validators.email]]
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
            await this.userRepo.forgetPassword(this.resetPasswordForm.get(`email`).value);
            this.matSnackBar.open(
                this.translate.instant(`An email with a password reset link was send!`),
                this.translate.instant(`OK`),
                {
                    duration: 0
                }
            );
            this.router.navigate([`..`]);
        } catch (e) {
            this.raiseError(e);
        }
    }
}
