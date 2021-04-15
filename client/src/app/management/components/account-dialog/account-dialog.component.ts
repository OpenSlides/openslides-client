import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PasswordForm } from 'app/shared/components/change-password/change-password.component';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';

interface MenuItem {
    name: string;
}

enum MenuItems {
    CHANGE_PASSWORD = 'Change password'
}

@Component({
    selector: 'os-account-dialog',
    templateUrl: './account-dialog.component.html',
    styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent extends BaseComponent implements OnInit {
    public readonly menuItems: MenuItem[] = [
        {
            name: MenuItems.CHANGE_PASSWORD
        }
    ];

    public readonly menuItemsRef = MenuItems;

    public get self(): ViewUser {
        return this._self;
    }

    public activeMenuItem = this.menuItems[0].name;

    public isUserPasswordValid = false;
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
        this.subscriptions.push(this.operator.userObservable.subscribe(user => (this._self = user)));
    }

    public async changePassword(): Promise<void> {
        const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;
        await this.userRepo.setPasswordSelf(this.self, oldPassword, newPassword);
        this.isUserPasswordValid = false;
    }
}
