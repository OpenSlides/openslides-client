import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'os-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
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
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        formBuilder: FormBuilder,
        private userRepo: UserControllerService
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
            await this.userRepo.forgetPassword(this.resetPasswordForm.get(`email`)!.value);
            this.matSnackBar.open(_(`An email with a password reset link was send!`), _(`OK`), {
                duration: 0
            });
            this.router.navigate([`..`]);
        } catch (e) {
            this.raiseError(e);
        }
    }
}
