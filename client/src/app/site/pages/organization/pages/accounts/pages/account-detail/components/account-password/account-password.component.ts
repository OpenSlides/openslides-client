import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { PasswordForm } from 'src/app/site/modules/user-components';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-account-password`,
    templateUrl: `./account-password.component.html`,
    styleUrls: [`./account-password.component.scss`]
})
export class AccountPasswordComponent extends BaseUiComponent implements OnInit, AfterViewInit {
    public isValid = false;
    public passwordForm: PasswordForm | string = ``;
    public user: ViewUser | null = null;
    public canManage = false;
    public isOwnPage = false;

    private userId: Id | null = null;

    public constructor(
        private operator: OperatorService,
        private userController: UserControllerService,
        private router: Router,
        private osRouter: OpenSlidesRouterService
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
                await this.userController.setPasswordSelf(this.user, oldPassword, newPassword);
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
