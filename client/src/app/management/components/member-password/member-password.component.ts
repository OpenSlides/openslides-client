import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { OperatorService } from 'app/core/core-services/operator.service';
import { OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PasswordForm } from 'app/shared/components/change-password/change-password.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-member-password',
    templateUrl: './member-password.component.html',
    styleUrls: ['./member-password.component.scss']
})
export class MemberPasswordComponent extends BaseModelContextComponent implements OnInit {
    public isValid = false;
    public passwordForm: PasswordForm | string = '';
    public user?: ViewUser;
    public canManage = false;
    public isOwnPage = false;

    private userId?: Id;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService,
        public repo: UserRepositoryService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params.id) {
                    this.userId = +params.id;
                    this.loadUser();
                }
            }),
            this.operator.operatorUpdatedEvent.subscribe(() => this.updatePermissions())
        );
    }

    /**
     * Triggered by the "x" Button of the Form
     */
    public goBack(): void {
        this.router.navigate(['members', this.user.id]);
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
            if (this.canManage && !this.isOwnPage) {
                const password = this.passwordForm as string;
                await this.repo.setPassword(this.user, password);
            } else if (this.isOwnPage) {
                const { oldPassword, newPassword }: PasswordForm = this.passwordForm as PasswordForm;
                await this.repo.setPasswordSelf(this.user, oldPassword, newPassword);
            }
            this.router.navigate(['members', this.user.id]);
        } catch (e) {
            this.raiseError(e);
        }
    }

    private loadUser(): void {
        this.requestModels({
            viewModelCtor: ViewUser,
            ids: [this.userId]
        });
        this.subscriptions.push(
            this.repo.getViewModelObservable(this.userId).subscribe(user => {
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
