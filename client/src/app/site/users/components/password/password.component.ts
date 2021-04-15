import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PasswordForm } from 'app/shared/components/change-password/change-password.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from '../../models/view-user';

/**
 * Component for the Password-Reset Handling
 */
@Component({
    selector: 'os-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent extends BaseModelContextComponent implements OnInit {
    public get isValid(): boolean {
        return this.canManage && !this.ownPage ? this.adminPasswordForm.valid : this.isUserPasswordValid;
    }

    /**
     * the user that is currently worked own
     */
    public user: ViewUser;

    /**
     * if this pw-page is for your own user
     */
    public ownPage: boolean;

    /**
     * if current user has the "can_manage" permission
     */
    public canManage: boolean;

    /**
     * formGroup for the admin user
     */
    public adminPasswordForm: FormGroup;

    /**
     * Value of the formGroup for a user.
     */
    public userPasswordForm: PasswordForm;

    /**
     * If the value of a new password for a user is valid.
     */
    public isUserPasswordValid = false;

    /**
     * if all password inputs is hidden
     */
    public hidePassword = true;

    /**
     * if the old password should be shown
     */
    public hideOldPassword = true;

    private urlUserId: number | null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private router: Router,
        private repo: UserRepositoryService,
        private operator: OperatorService,
        private formBuilder: FormBuilder
    ) {
        super(componentServiceCollector);
    }

    /**
     * Initializes the forms and some of the frontend options
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(this.translate.instant('Change password'));
        this.route.params.subscribe(params => {
            if (params.id) {
                this.urlUserId = +params.id;
                this.requestModels({
                    viewModelCtor: ViewUser,
                    ids: [this.urlUserId]
                });
                this.repo.getViewModelObservable(this.urlUserId).subscribe(user => {
                    this.user = user;
                    this.updateUser();
                });
            }
            this.updateUser();
        });

        this.operator.operatorUpdatedEvent.subscribe(() => {
            this.updateUser();
        });

        this.adminPasswordForm = this.formBuilder.group({
            newPassword: ['', Validators.required]
        });
    }

    private updateUser(): void {
        this.ownPage = this.urlUserId ? this.operator.operatorId === this.urlUserId : true;
        this.canManage = this.operator.hasPerms(Permission.usersCanManage);
    }

    /**
     * Triggered by the "x" Button of the Form
     */
    public goBack(): void {
        if (!this.ownPage) {
            this.router.navigate([`./users/${this.user.id}`]);
        } else {
            this.router.navigate(['./']);
        }
    }

    /**
     * Handles the whole save routine for every possible event
     */
    public async save(): Promise<void> {
        // can Manage, but not own Page (a.k.a. Admin)
        try {
            if (this.canManage && !this.ownPage) {
                if (!this.adminPasswordForm.valid) {
                    return;
                }
                const password = this.adminPasswordForm.value.newPassword;
                await this.repo.setPassword(this.user, password);
                this.router.navigate([this.activeMeetingId, `/users/${this.user.id}`]);
            } else if (this.ownPage) {
                if (!this.isUserPasswordValid) {
                    return;
                }

                const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;
                await this.repo.setPasswordSelf(this.user, oldPassword, newPassword);
                this.router.navigate(['./']);
            }
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.save();
        }
    }

    /**
     * Takes generated password and puts it into admin PW field
     * and displays it
     */
    public generatePassword(): void {
        const randomPassword = this.repo.getRandomPassword();
        this.adminPasswordForm.patchValue({
            newPassword: randomPassword
        });
        this.hidePassword = false;
    }
}
