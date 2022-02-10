import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
    GetUserRelatedModelsCommittee,
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsUser
} from 'app/core/core-services/presenters/get-user-related-models-presenter.service';
import { ViewUser } from 'app/site/users/models/view-user';

import { CML } from '../../../core/core-services/organization-permission';

interface MemberDeleteDialogConfig {
    toRemove: ViewUser[];
    toDelete: GetUserRelatedModelsPresenterResult;
}

const TO_REMOVE_LABEL = _(`These accounts will be removed from the meeting:`);
const TO_DELETE_LABEL = _(`These accounts will be deleted:`);

@Component({
    selector: `os-member-delete-dialog`,
    templateUrl: `./member-delete-dialog.component.html`,
    styleUrls: [`./member-delete-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MemberDeleteDialogComponent implements OnInit {
    public get members(): any[] {
        return this._members;
    }

    public get isOneMember(): boolean {
        return this.toDeleteMembers.length + this.toRemoveMembers.length === 1;
    }

    public set selectedMember(member: GetUserRelatedModelsUser) {
        if (this._selectedMember === member) {
            this._selectedMember = null;
        } else {
            this._selectedMember = member;
        }
    }

    public get selectedMember(): GetUserRelatedModelsUser | null {
        return this._selectedMember;
    }

    private get toDeleteMembers(): GetUserRelatedModelsUser[] {
        return Object.values(this.data.toDelete);
    }

    private get toRemoveMembers(): ViewUser[] {
        return this.data.toRemove;
    }

    private _selectedMember: GetUserRelatedModelsUser | null = null;
    private _members: any[] = [];

    public constructor(@Inject(MAT_DIALOG_DATA) private data: MemberDeleteDialogConfig) {}

    public ngOnInit(): void {
        this._members = this.getMembers();
        this.selectedMember = this._members[1]; // At index 0 is only a label
    }

    public willBeRemoved(member: ViewUser | GetUserRelatedModelsUser): boolean {
        return member instanceof ViewUser;
    }

    public hasRelations(member: GetUserRelatedModelsUser): boolean {
        return member.meetings?.length > 0 || this.getManagedCommittees(member).length > 0;
    }

    public isSectionTitle(value: unknown): boolean {
        return typeof value === `string`;
    }

    public getManagedCommittees(member: GetUserRelatedModelsUser): GetUserRelatedModelsCommittee[] {
        return (member.committees || []).filter(committee => committee.cml === CML.can_manage);
    }

    private getMembers(): any[] {
        let members = [];
        if (this.toRemoveMembers.length > 0) {
            members = members.concat(TO_REMOVE_LABEL, this.toRemoveMembers);
        }
        if (this.toDeleteMembers.length > 0) {
            members = members.concat(TO_DELETE_LABEL, this.toDeleteMembers);
        }
        return members;
    }
}
