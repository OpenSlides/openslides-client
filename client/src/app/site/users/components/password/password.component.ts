import { Component, OnInit } from '@angular/core';
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
    public isValid = false;
    public passwordForm: PasswordForm | string = '';

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

    private urlUserId: number | null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService,
        public repo: UserRepositoryService
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
            this.router.navigate([this.activeMeetingId, 'users', this.user.id]);
        } else {
            this.router.navigate(['..'], { relativeTo: this.route });
        }
    }

    /**
     * Handles the whole save routine for every possible event
     */
    public async save(): Promise<void> {
        if (!this.isValid) {
            return;
        }
        // can Manage, but not own Page (a.k.a. Admin)
        try {
            if (this.canManage && !this.ownPage) {
                const password = this.passwordForm as string;
                await this.repo.setPassword(this.user, password);
                this.router.navigate([this.activeMeetingId, 'users', this.user.id]);
            } else if (this.ownPage) {
                const { oldPassword, newPassword }: PasswordForm = this.passwordForm as PasswordForm;
                await this.repo.setPasswordSelf(this.user, oldPassword, newPassword);
                this.router.navigate(['..'], { relativeTo: this.route });
            }
        } catch (e) {
            this.raiseError(e);
        }
    }
}
