import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

@Component({
    selector: `os-reset-password-confirm`,
    templateUrl: `./reset-password-confirm.component.html`,
    styleUrls: [`./reset-password-confirm.component.scss`]
})
export class ResetPasswordConfirmComponent extends BaseComponent implements OnInit {
    /**
     * THis form holds one control for the new password.
     */
    public newPasswordForm: UntypedFormGroup;

    /**
     * The user_id that should be provided in the queryparams.
     */
    private user_id!: Id;

    /**
     * The token that should be provided in the queryparams.
     */
    private token!: string;

    /**
     * Constructur for the reset password confirm view. Initializes the form for the new password.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute,
        private userRepo: UserControllerService
    ) {
        super(componentServiceCollector, translate);
        this.newPasswordForm = formBuilder.group({
            password: [``, [Validators.required]]
        });
    }

    /**
     * Sets the title of the page and gets the queryparams.
     */
    public ngOnInit(): void {
        super.setTitle(`Reset password`);
        this.activatedRoute.queryParams.subscribe(params => {
            if (!this.user_id && !this.token) {
                if (!params[`user_id`] || !params[`token`]) {
                    setTimeout(() => {
                        this.matSnackBar.open(``);
                        this.matSnackBar.open(
                            this.translate.instant(`The link is broken. Please contact your system administrator.`),
                            this.translate.instant(`OK`),
                            {
                                duration: 0
                            }
                        );
                        this.router.navigate([`..`]);
                    });
                } else {
                    this.user_id = Number(params[`user_id`]);
                    this.token = params[`token`];
                }
            }
        });
    }

    /**
     * Submit the new password.
     */
    public async submitNewPassword(): Promise<void> {
        if (this.newPasswordForm.invalid) {
            return;
        }

        try {
            await this.userRepo.forgetPasswordConfirm({
                user_id: this.user_id,
                authorization_token: this.token,
                new_password: this.newPasswordForm.get(`password`)!.value
            });

            this.matSnackBar.open(
                this.translate.instant(`Your password has been reset successfully!`),
                this.translate.instant(`OK`),
                {
                    duration: 0
                }
            );
            this.router.navigate([`/login`]);
        } catch (e) {
            if (e?.message) {
                this.matSnackBar.open(this.translate.instant(e.message), this.translate.instant(`OK`), {
                    duration: 0
                });
            }

            console.log(`error`, e);
        }
    }
}
