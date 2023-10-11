import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CML } from 'src/app/domain/definitions/organization-permission';
import {
    GetUserRelatedModelsCommittee,
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsUser
} from 'src/app/gateways/presenter';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';

interface UserDeleteDialogConfig {
    toRemove: ViewUser[];
    toDelete: GetUserRelatedModelsPresenterResult;
}

@Component({
    selector: `os-user-delete-dialog`,
    templateUrl: `./user-delete-dialog.component.html`,
    styleUrls: [`./user-delete-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class UserDeleteDialogComponent implements OnInit {
    public get isOneUser(): boolean {
        return this.toDeleteUsers.length + this.toRemoveUsers.length === 1;
    }

    public get isOneUserToDelete(): boolean {
        return this.toDeleteUsers.length === 1 && this.toRemoveUsers.length === 0;
    }

    public get isOneUserToRemove(): boolean {
        return this.toDeleteUsers.length === 0 && this.toRemoveUsers.length === 1;
    }

    public get hasUsersToDelete(): boolean {
        return this.toDeleteUsers.length > 0;
    }

    public get hasUsersToRemove(): boolean {
        return this.toRemoveUsers.length > 0;
    }

    public get toDeleteUsers(): GetUserRelatedModelsUser[] {
        return Object.values(this.data.toDelete);
    }

    public get toRemoveUsers(): ViewUser[] {
        return this.data.toRemove;
    }

    public selectedUser: GetUserRelatedModelsUser | ViewUser = null;

    public constructor(
        @Inject(MAT_DIALOG_DATA) private data: UserDeleteDialogConfig,
        private operator: OperatorService
    ) {}

    public ngOnInit(): void {
        this.selectedUser = this.toDeleteUsers[0] || this.toRemoveUsers[0];
    }

    public willBeRemoved(user: ViewUser | GetUserRelatedModelsUser): boolean {
        return user instanceof ViewUser;
    }

    public hasRelations(user: GetUserRelatedModelsUser): boolean {
        return (user.meetings || []).length > 0 || this.getManagedCommittees(user).length > 0;
    }

    public getManagedCommittees(user: GetUserRelatedModelsUser): GetUserRelatedModelsCommittee[] {
        return (user.committees || []).filter(committee => committee.cml === CML.can_manage);
    }

    public isOperator(user: GetUserRelatedModelsUser): boolean {
        return user.id == this.operator.operatorId;
    }
}
