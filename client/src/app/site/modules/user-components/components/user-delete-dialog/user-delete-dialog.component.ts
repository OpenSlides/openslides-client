import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { CML } from 'src/app/domain/definitions/organization-permission';
import {
    GetUserRelatedModelsCommittee,
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsUser
} from 'src/app/gateways/presenter';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

interface UserDeleteDialogConfig {
    toRemove: ViewUser[];
    toDelete: GetUserRelatedModelsPresenterResult;
}

const TO_REMOVE_LABEL = _(`These accounts will be removed from the meeting:`);
const TO_DELETE_LABEL = _(`These accounts will be deleted:`);

@Component({
    selector: `os-user-delete-dialog`,
    templateUrl: `./user-delete-dialog.component.html`,
    styleUrls: [`./user-delete-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class UserDeleteDialogComponent implements OnInit {
    public get users(): any[] {
        return this._users;
    }

    public get isOneUser(): boolean {
        return this.toDeleteUsers.length + this.toRemoveUsers.length === 1;
    }

    public set selectedUser(user: GetUserRelatedModelsUser | null) {
        if (this._selectedUser === user) {
            this._selectedUser = null;
        } else {
            this._selectedUser = user;
        }
    }

    public get selectedUser(): GetUserRelatedModelsUser | null {
        return this._selectedUser;
    }

    private get toDeleteUsers(): GetUserRelatedModelsUser[] {
        return Object.values(this.data.toDelete);
    }

    private get toRemoveUsers(): ViewUser[] {
        return this.data.toRemove;
    }

    private _selectedUser: GetUserRelatedModelsUser | null = null;
    private _users: any[] = [];

    public constructor(@Inject(MAT_DIALOG_DATA) private data: UserDeleteDialogConfig) {}

    public ngOnInit(): void {
        this._users = this.getUsers();
        this.selectedUser = this._users[1]; // At index 0 is only a label
    }

    public willBeRemoved(user: ViewUser | GetUserRelatedModelsUser): boolean {
        return user instanceof ViewUser;
    }

    public hasRelations(user: GetUserRelatedModelsUser): boolean {
        return (user.meetings || []).length > 0 || this.getManagedCommittees(user).length > 0;
    }

    public isSectionTitle(value: unknown): boolean {
        return typeof value === `string`;
    }

    public getManagedCommittees(user: GetUserRelatedModelsUser): GetUserRelatedModelsCommittee[] {
        return (user.committees || []).filter(committee => committee.cml === CML.can_manage);
    }

    private getUsers(): any[] {
        let user: unknown[] = [];
        if (this.toRemoveUsers.length > 0) {
            user = user.concat(TO_REMOVE_LABEL, this.toRemoveUsers);
        }
        if (this.toDeleteUsers.length > 0) {
            user = user.concat(TO_DELETE_LABEL, this.toDeleteUsers);
        }
        return user;
    }
}
