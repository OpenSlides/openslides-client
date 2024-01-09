import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseComponent } from 'src/app/site/base/base.component';
import { PasswordForm } from 'src/app/site/modules/user-components';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { AuthService } from 'src/app/site/services/auth.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

@Component({
    selector: `os-account-password`,
    templateUrl: `./account-password.component.html`,
    styleUrls: [`./account-password.component.scss`]
})
export class AccountPasswordComponent extends BaseComponent implements OnInit, AfterViewInit {
    public isValid = false;
    public passwordForm: PasswordForm | string = ``;
    public user: ViewUser | null = null;
    public canManage = false;
    public isOwnPage = false;

    private userId: Id | null = null;

    public constructor(
        private operator: OperatorService,
        private userController: UserControllerService,
        private authService: AuthService,
        private osRouter: OpenSlidesRouterService,
        private snackbar: MatSnackBar
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`id`]) {
                    this.userId = +params[`id`];
                    this.loadUser();
                }
            }),
            this.operator.operatorUpdated.subscribe(() => this.updatePermissions())
        );
    }

    public ngAfterViewInit(): void {
        setTimeout(() => this.updatePermissions()); // Initial check
    }

    /**
     * Triggered by the "x" Button of the Form
     */
    public goBack(): void {
        if (this.user) {
            this.router.navigate([`accounts`, this.user.id]);
        }
    }

    public getGeneratePasswordFn(): () => string {
        return this.userController.getRandomPassword;
    }

    /**
     * Handles the whole save routine for every possible event
     */
    public async save(): Promise<void> {
        if (!this.isValid || !this.user) {
            return;
        }
        // can Manage, but not own Page (a.k.a. Admin)
        try {
            if (this.canManage && !this.isOwnPage) {
                const password = this.passwordForm as string;
                await this.userController.setPassword(this.user, password);
            } else if (this.isOwnPage) {
                const { oldPassword, newPassword }: PasswordForm = this.passwordForm as PasswordForm;
                await this.authService.invalidateSessionAfter(() =>
                    this.userController.setPasswordSelf(this.user, oldPassword, newPassword)
                );
                this.snackbar.open(this.translate.instant(`Password changed successfully!`), `Ok`);
            }
            this.goBack();
        } catch (e) {
            this.raiseError(e as any);
        }
    }

    private loadUser(): void {
        this.subscriptions.push(
            this.userController.getViewModelObservable(this.userId!).subscribe(user => {
                this.user = user;
                this.updatePermissions();
            })
        );
    }

    private updatePermissions(): void {
        this.isOwnPage = this.userId === this.operator.operatorId;
        this.canManage = this.operator.hasOrganizationPermissions(OML.can_manage_users);
    }
}
