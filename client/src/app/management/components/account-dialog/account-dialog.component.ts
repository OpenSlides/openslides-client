import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ChangePasswordComponent, PasswordForm } from 'app/shared/components/change-password/change-password.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

interface MenuItem {
    name: string;
}

enum MenuItems {
    CHANGE_PASSWORD = 'Change password',
    SHOW_PROFILE = 'Show profile'
}

@Component({
    selector: 'os-account-dialog',
    templateUrl: './account-dialog.component.html',
    styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild('changePasswordComponent', { static: false })
    public changePasswordComponent: ChangePasswordComponent;

    public readonly menuItems: MenuItem[] = [
        {
            name: MenuItems.SHOW_PROFILE
        },
        {
            name: MenuItems.CHANGE_PASSWORD
        }
    ];

    public readonly menuItemsRef = MenuItems;

    public get self(): ViewUser {
        return this._self;
    }

    public activeMenuItem = this.menuItems[0].name;

    public editSelf = false;
    public isUserFormValid = false;
    public isUserPasswordValid = false;
    public userPersonalForm: any;
    public userPasswordForm: PasswordForm;

    private _self: ViewUser;

    public constructor(
        serviceCollector: ComponentServiceCollector,
        public dialogRef: MatDialogRef<AccountDialogComponent>,
        private operator: OperatorService,
        private userRepo: UserRepositoryService
    ) {
        super(serviceCollector);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(
            this.userRepo.getViewModelObservable(this.operator.operatorId).subscribe(user => (this._self = user))
        );
    }

    public async changePassword(): Promise<void> {
        const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;
        await this.userRepo.setPasswordSelf(this.self, oldPassword, newPassword);
        this.changePasswordComponent.reset();
    }

    public async saveUserChanges(): Promise<void> {
        await this.userRepo.update(this.userPersonalForm, this.self);
        this.isUserFormValid = false;
        this.editSelf = false;
    }

    public getModelRequest(): SimplifiedModelRequest | null {
        return {
            viewModelCtor: ViewUser,
            ids: [this.operator.operatorId],
            fieldset: 'orgaEdit'
        };
    }
}
